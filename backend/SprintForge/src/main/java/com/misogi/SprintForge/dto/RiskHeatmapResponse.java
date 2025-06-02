package com.misogi.SprintForge.dto;

import lombok.Data;
import java.util.Map;

@Data
public class RiskHeatmapResponse {
    private Map<String, String> userRiskMap;
} 