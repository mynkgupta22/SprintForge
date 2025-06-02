package com.misogi.SprintForge.service.ai;

import com.misogi.SprintForge.dto.*;
import com.misogi.SprintForge.model.Task;
import com.misogi.SprintForge.model.Sprint;
import com.misogi.SprintForge.model.User;
import com.misogi.SprintForge.repository.TaskRepository;
import com.misogi.SprintForge.repository.SprintRepository;
import com.misogi.SprintForge.repository.UserRepository;
import com.misogi.SprintForge.repository.ActivityRepository;
import com.misogi.SprintForge.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AISprintService {
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private SprintRepository sprintRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ActivityRepository activityRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private GeminiService geminiService;

    public SuggestSprintResponse suggestSprint(SuggestSprintRequest request) {
        // Fetch unassigned tasks for the project
        List<Task> unassignedTasks = taskRepository.findByProjectIdAndSprintIsNull(request.getProjectId())
            .stream().filter(t -> t.getStatus() != Task.TaskStatus.DONE).collect(Collectors.toList());
        // Sort by priority (HIGHEST > HIGH > MEDIUM > LOW > LOWEST)
        unassignedTasks.sort(Comparator.comparing(Task::getPriority));
        // Get sprint capacity
        Integer capacity = null;
        if (request.getSprintId() != null) {
            Optional<Sprint> sprintOpt = sprintRepository.findById(request.getSprintId());
            if (sprintOpt.isPresent()) {
                capacity = sprintOpt.get().getCapacity();
            }
        }
        if (capacity == null) capacity = 20; // Default fallback
        // Build prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a sprint planner. Here are ").append(unassignedTasks.size()).append(" upcoming tasks:\n");
        for (Task t : unassignedTasks) {
            prompt.append("- Task: ").append(t.getKey())
                  .append(", Estimate: ").append(t.getEstimate()).append("h")
                  .append(", Priority: ").append(t.getPriority()).append("\n");
        }
        prompt.append("The current sprint has a capacity of ").append(capacity).append(" hours.\n");
        prompt.append("Suggest an optimal sprint plan by selecting tasks that can fit into this capacity.\n");
        prompt.append("Return a comma-separated list of task keys to assign to this sprint.");
        // Call Gemini
        List<String> selectedTaskKeys = new ArrayList<>();
        try {
            String response = geminiService.ask(prompt.toString());
            // Parse response: expect comma-separated list of keys
            for (String key : response.split(",")) {
                String trimmed = key.trim();
                if (!trimmed.isEmpty()) selectedTaskKeys.add(trimmed);
            }
        } catch (Exception e) {
            // Fallback: return empty or all
        }
        SuggestSprintResponse resp = new SuggestSprintResponse();
        resp.setTaskKeys(selectedTaskKeys);
        return resp;
    }

    public ScopeCreepResponse detectScopeCreep(ScopeCreepRequest request) {
        ScopeCreepResponse resp = new ScopeCreepResponse();
        Optional<Sprint> sprintOpt = sprintRepository.findById(request.getSprintId());
        if (sprintOpt.isEmpty()) return resp;
        Sprint sprint = sprintOpt.get();
        List<Task> sprintTasks = taskRepository.findBySprintId(sprint.getId());
        // Find tasks added after sprint start
        List<Task> addedAfterStart = sprintTasks.stream()
            .filter(t -> t.getCreatedAt().toLocalDate().isAfter(sprint.getStartDate()))
            .collect(Collectors.toList());
        // Calculate original and current total estimates
        int originalEstimate = 0;
        int addedEstimate = 0;
        for (Task t : sprintTasks) {
            if (t.getCreatedAt().toLocalDate().isAfter(sprint.getStartDate())) {
                addedEstimate += t.getEstimate();
            } else {
                originalEstimate += t.getEstimate();
            }
        }
        int totalEstimate = originalEstimate + addedEstimate;
        boolean scopeCreep = (originalEstimate > 0) && (addedEstimate > 0) && (addedEstimate > 0.2 * originalEstimate);
        // Build prompt for Gemini
        StringBuilder prompt = new StringBuilder();
        prompt.append("Sprint ").append(sprint.getName()).append(" started on ")
            .append(sprint.getStartDate()).append(". Since then, ")
            .append(addedAfterStart.size()).append(" new tasks were added:\n");
        for (Task t : addedAfterStart) {
            prompt.append("- ").append(t.getKey()).append(" (Estimate: ")
                .append(t.getEstimate()).append("h), added ")
                .append(t.getCreatedAt().toLocalDate()).append("\n");
        }
        prompt.append("The original sprint estimate was ").append(originalEstimate)
            .append("h, now increased to ").append(totalEstimate).append("h.\n");
        prompt.append("Is the sprint at risk of scope creep? If estimate total increased > 20% of original plan, warn.\n");
        prompt.append("Reply with a warning message if scope creep is detected, else say 'No significant scope creep.'\n");
        try {
            String response = geminiService.ask(prompt.toString());
            resp.setWarningMessage(response);
            resp.setScopeCreepDetected(response.toLowerCase().contains("scope creep") || scopeCreep);
        } catch (Exception e) {
            resp.setWarningMessage("Could not analyze scope creep.");
            resp.setScopeCreepDetected(scopeCreep);
        }
        return resp;
    }

    public RiskHeatmapResponse generateRiskHeatmap(RiskHeatmapRequest request) {
        RiskHeatmapResponse resp = new RiskHeatmapResponse();
        Optional<Sprint> sprintOpt = sprintRepository.findById(request.getSprintId());
        if (sprintOpt.isEmpty()) return resp;
        Sprint sprint = sprintOpt.get();
        List<Task> sprintTasks = taskRepository.findBySprintId(sprint.getId());
        Map<User, List<Task>> tasksByUser = sprintTasks.stream()
            .filter(t -> t.getAssignee() != null)
            .collect(Collectors.groupingBy(Task::getAssignee));
        StringBuilder prompt = new StringBuilder();
        prompt.append("Here are task assignments:\n");
        for (Map.Entry<User, List<Task>> entry : tasksByUser.entrySet()) {
            User user = entry.getKey();
            List<Task> tasks = entry.getValue();
            int inProgress = (int) tasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.IN_PROGRESS).count();
            int todo = (int) tasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.TODO).count();
            int overdue = (int) tasks.stream().filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(java.time.LocalDateTime.now()) && t.getStatus() != Task.TaskStatus.DONE).count();
            int totalEstimate = tasks.stream().mapToInt(Task::getEstimate).sum();
            prompt.append("- ").append(user.getFirstName()).append(" ").append(user.getLastName()).append(": ")
                .append(tasks.size()).append(" tasks (").append(totalEstimate).append("h), ")
                .append(overdue).append(" tasks are overdue\n");
        }
        prompt.append("Highlight which team members are at risk of being overloaded or blocked. Output a map of user to status like: 'User A is at risk (overdue tasks and heavy load)'\n");
        Map<String, String> userRiskMap = new HashMap<>();
        try {
            String response = geminiService.ask(prompt.toString());
            // Try to parse: expect lines like 'User A: ...' or 'User A is at risk ...'
            for (String line : response.split("\n")) {
                if (line.contains(":")) {
                    String[] parts = line.split(":", 2);
                    userRiskMap.put(parts[0].trim(), parts[1].trim());
                } else if (line.contains("is at risk") || line.contains("is balanced")) {
                    int idx = line.indexOf("is ");
                    if (idx > 0) {
                        String name = line.substring(0, idx).trim();
                        userRiskMap.put(name, line.substring(idx).trim());
                    }
                }
            }
        } catch (Exception e) {
            // fallback: empty
        }
        resp.setUserRiskMap(userRiskMap);
        return resp;
    }

    public RetrospectiveResponse generateRetrospective(RetrospectiveRequest request) {
        RetrospectiveResponse resp = new RetrospectiveResponse();
        Optional<Sprint> sprintOpt = sprintRepository.findById(request.getSprintId());
        if (sprintOpt.isEmpty()) return resp;
        Sprint sprint = sprintOpt.get();
        List<Task> sprintTasks = taskRepository.findBySprintId(sprint.getId());
        int total = sprintTasks.size();
        int completed = (int) sprintTasks.stream().filter(t -> t.getStatus() == Task.TaskStatus.DONE).count();
        int carriedOver = (int) sprintTasks.stream().filter(t -> t.getStatus() != Task.TaskStatus.DONE).count();
        // Tasks with delays >2 days
        List<Task> delayedTasks = sprintTasks.stream()
            .filter(t -> t.getStatus() == Task.TaskStatus.DONE && t.getDueDate() != null && t.getUpdatedAt() != null && java.time.Duration.between(t.getDueDate(), t.getUpdatedAt()).toDays() > 2)
            .collect(Collectors.toList());
        // Frequent status changes (from activities)
        Map<String, Long> statusChangeCounts = new HashMap<>();
        for (Task t : sprintTasks) {
            List<com.misogi.SprintForge.model.Activity> acts = activityRepository.findByTaskIdOrderByCreatedAtDesc(t.getId());
            long statusChanges = acts.stream().filter(a -> a.getType() == com.misogi.SprintForge.model.Activity.ActivityType.STATUS_CHANGED).count();
            if (statusChanges > 2) {
                statusChangeCounts.put(t.getKey(), statusChanges);
            }
        }
        // Build prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("Sprint ").append(sprint.getName()).append(" had ").append(total).append(" tasks:\n");
        prompt.append("- ").append(completed).append(" completed\n");
        prompt.append("- ").append(carriedOver).append(" carried over\n");
        prompt.append("- ").append(delayedTasks.size()).append(" tasks had delays >2 days\n");
        if (!statusChangeCounts.isEmpty()) {
            prompt.append("Frequent status changes observed on: ");
            for (String key : statusChangeCounts.keySet()) {
                prompt.append(key).append(", ");
            }
            prompt.append("\n");
        }
        prompt.append("Please generate a retrospective summary with: What went well, What can be improved, Action items. Output in markdown or plain text.\n");
        try {
            String summary = geminiService.ask(prompt.toString());
            resp.setSummary(summary);
        } catch (Exception e) {
            resp.setSummary("Could not generate retrospective.");
        }
        return resp;
    }
} 