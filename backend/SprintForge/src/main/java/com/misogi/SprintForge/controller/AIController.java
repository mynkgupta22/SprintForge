package com.misogi.SprintForge.controller;

import com.misogi.SprintForge.dto.*;
import com.misogi.SprintForge.service.ai.AISprintService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    @Autowired
    private AISprintService aiSprintService;

    @PostMapping("/suggest-sprint")
    public SuggestSprintResponse suggestSprint(@RequestBody SuggestSprintRequest request) {
        return aiSprintService.suggestSprint(request);
    }

    @PostMapping("/scope-creep")
    public ScopeCreepResponse detectScopeCreep(@RequestBody ScopeCreepRequest request) {
        return aiSprintService.detectScopeCreep(request);
    }

    @PostMapping("/risk-heatmap")
    public RiskHeatmapResponse generateRiskHeatmap(@RequestBody RiskHeatmapRequest request) {
        return aiSprintService.generateRiskHeatmap(request);
    }

    @PostMapping("/retrospective")
    public RetrospectiveResponse generateRetrospective(@RequestBody RetrospectiveRequest request) {
        return aiSprintService.generateRetrospective(request);
    }
} 