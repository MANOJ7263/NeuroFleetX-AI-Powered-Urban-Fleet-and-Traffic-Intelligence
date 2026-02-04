package com.neurofleetx.trip.service;

import com.neurofleetx.trip.util.RouteGraph;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoutingService {

    private final GoogleMapsService googleMapsService;

    public RoutingService(GoogleMapsService googleMapsService) {
        this.googleMapsService = googleMapsService;
    }

    public com.google.maps.model.DirectionsResult getDirections(String origin, String destination) {
        return googleMapsService.getDirections(origin, destination);
    }

    public RouteGraph createSampleGraph() {
        RouteGraph graph = new RouteGraph();

        // Sample Nodes (Cities)
        // Coimbatore
        graph.addNode("Coimbatore", 11.0168, 76.9558);
        // Tiruppur
        graph.addNode("Tiruppur", 11.1085, 77.3411);
        // Erode
        graph.addNode("Erode", 11.3410, 77.7172);
        // Salem
        graph.addNode("Salem", 11.6643, 78.1460);
        // Chennai
        graph.addNode("Chennai", 13.0827, 80.2707);
        // Madurai
        graph.addNode("Madurai", 9.9252, 78.1198);
        // Trichy
        graph.addNode("Trichy", 10.7905, 78.7047);

        // Edges (Roads)
        // Coimbatore -> Tiruppur (55km, 10min traffic delay)
        graph.addEdge("Coimbatore", "Tiruppur", 55.0, 10.0);
        // Tiruppur -> Erode (50km, 10min)
        graph.addEdge("Tiruppur", "Erode", 50.0, 10.0);
        // Erode -> Salem (65km, 15min)
        graph.addEdge("Erode", "Salem", 65.0, 15.0);
        // Salem -> Chennai (340km, 45min)
        graph.addEdge("Salem", "Chennai", 340.0, 45.0);

        // Alternate route: Coimbatore -> Madurai -> Trichy -> Chennai
        // Coimbatore -> Madurai (215km, 30min)
        graph.addEdge("Coimbatore", "Madurai", 215.0, 30.0);
        // Madurai -> Trichy (135km, 20min)
        graph.addEdge("Madurai", "Trichy", 135.0, 20.0);
        // Trichy -> Chennai (330km, 40min)
        graph.addEdge("Trichy", "Chennai", 330.0, 40.0);

        return graph;
    }

    public PathResult findOptimizedPath(RouteGraph graph, String startNodeId, String endNodeId) {

        Map<String, Double> distances = new HashMap<>();
        Map<String, String> previous = new HashMap<>();
        PriorityQueue<NodeCost> priorityQueue = new PriorityQueue<>(Comparator.comparingDouble(NodeCost::getCost));
        Set<String> visited = new HashSet<>();

        // Initialize distances
        for (String nodeId : graph.getNodes().keySet()) {
            distances.put(nodeId, Double.MAX_VALUE);
        }
        distances.put(startNodeId, 0.0);
        priorityQueue.add(new NodeCost(startNodeId, 0.0));

        while (!priorityQueue.isEmpty()) {
            NodeCost current = priorityQueue.poll();
            String currentNodeId = current.getNodeId();

            if (!visited.add(currentNodeId)) {
                continue;
            }

            if (currentNodeId.equals(endNodeId)) {
                break;
            }

            for (RouteGraph.Edge edge : graph.getNeighbors(currentNodeId)) {
                if (visited.contains(edge.getTarget())) {
                    continue;
                }

                double edgeCost = calculateCost(edge);
                double newDist = distances.get(currentNodeId) + edgeCost;

                if (newDist < distances.get(edge.getTarget())) {
                    distances.put(edge.getTarget(), newDist);
                    previous.put(edge.getTarget(), currentNodeId);
                    priorityQueue.add(new NodeCost(edge.getTarget(), newDist));
                }
            }
        }

        return reconstructPath(previous, startNodeId, endNodeId, graph, distances.get(endNodeId));
    }

    private double calculateCost(RouteGraph.Edge edge) {
        // Cost = (Distance * 0.6) + (Traffic_Delay * 0.4)
        return (edge.getDistanceKm() * 0.6) + (edge.getTrafficDelayMinutes() * 0.4);
    }

    private PathResult reconstructPath(Map<String, String> previous, String startNodeId, String endNodeId,
            RouteGraph graph, double totalCost) {
        List<RouteGraph.Node> path = new ArrayList<>();
        String current = endNodeId;

        // processing path
        if (!previous.containsKey(current) && !startNodeId.equals(current)) {
            // No path found
            return new PathResult(Collections.emptyList(), 0.0, 0.0);
        }

        while (current != null) {
            path.add(graph.getNodes().get(current));
            current = previous.get(current);
        }
        Collections.reverse(path);

        // Calculate total distance and time from the path
        double totalDistance = 0;
        double totalTime = 0; // assuming base time = distance / speed? Or just sum traffic delay?
        // Let's just sum segments for now if we needed exact metrics,
        // but for now I'll return the cost as the primary metric or re-traverse to sum
        // specific attributes.

        // Let's re-traverse to get accurate distance/time sums
        if (!path.isEmpty()) {
            for (int i = 0; i < path.size() - 1; i++) {
                String u = path.get(i).getId();
                String v = path.get(i + 1).getId();
                // Find edge u -> v
                for (RouteGraph.Edge e : graph.getNeighbors(u)) {
                    if (e.getTarget().equals(v)) {
                        totalDistance += e.getDistanceKm();
                        totalTime += e.getTrafficDelayMinutes(); // This is just delay, not travel time.
                        // Travel time approx = (Distance / 50km/h) * 60 + Delay ?
                        // Let's assume standard speed 50km/h for city
                        totalTime += (e.getDistanceKm() / 50.0) * 60;
                        break;
                    }
                }
            }
        }

        return new PathResult(path, totalDistance, totalTime);
    }

    // Helper classes
    private static class NodeCost {
        private String nodeId;
        private double cost;

        public NodeCost(String nodeId, double cost) {
            this.nodeId = nodeId;
            this.cost = cost;
        }

        public String getNodeId() {
            return nodeId;
        }

        public double getCost() {
            return cost;
        }
    }

    public static class PathResult {
        private List<RouteGraph.Node> path;
        private double totalDistanceKm;
        private double estimatedTimeMinutes;

        public PathResult(List<RouteGraph.Node> path, double totalDistanceKm, double estimatedTimeMinutes) {
            this.path = path;
            this.totalDistanceKm = totalDistanceKm;
            this.estimatedTimeMinutes = estimatedTimeMinutes;
        }

        public List<RouteGraph.Node> getPath() {
            return path;
        }

        public double getTotalDistanceKm() {
            return totalDistanceKm;
        }

        public double getEstimatedTimeMinutes() {
            return estimatedTimeMinutes;
        }
    }
}
