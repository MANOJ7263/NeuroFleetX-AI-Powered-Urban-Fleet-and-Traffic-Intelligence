package com.neurofleetx.trip.util;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.*;

@Data
public class RouteGraph {
    private Map<String, Node> nodes = new HashMap<>();
    private Map<String, List<Edge>> adjacencyList = new HashMap<>();

    public void addNode(String id, double lat, double lng) {
        nodes.put(id, new Node(id, lat, lng));
        adjacencyList.putIfAbsent(id, new ArrayList<>());
    }

    public void addEdge(String sourceId, String targetId, double distanceKm, double trafficDelayMinutes) {
        Edge edge = new Edge(sourceId, targetId, distanceKm, trafficDelayMinutes);
        adjacencyList.get(sourceId).add(edge);
        // Assuming undirected graph for roads unless specified otherwise, but usually
        // roads are directed graphed for navigation.
        // For simplicity in this milestone, we might assume directed or we can add
        // reverse edge.
        // "road segments as weighted edges" -> let's stick to directed for better
        // modeling (one-way streets etc),
        // but for basic city grid often bidirectional. I'll add one way for now, caller
        // can add reverse if needed.
    }

    public List<Edge> getNeighbors(String nodeId) {
        return adjacencyList.getOrDefault(nodeId, Collections.emptyList());
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Node {
        private String id;
        private double latitude;
        private double longitude;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class Edge {
        private String source;
        private String target;
        private double distanceKm;
        private double trafficDelayMinutes;
    }
}
