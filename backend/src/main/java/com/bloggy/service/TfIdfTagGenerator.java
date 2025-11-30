package com.bloggy.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TfIdfTagGenerator {

    // Common English stop words to filter out
    private static final Set<String> STOP_WORDS = Set.of(
        "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
        "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
        "should", "may", "might", "must", "shall", "can", "need", "dare", "ought",
        "used", "it", "its", "this", "that", "these", "those", "i", "you", "he",
        "she", "we", "they", "what", "which", "who", "whom", "whose", "where",
        "when", "why", "how", "all", "each", "every", "both", "few", "more",
        "most", "other", "some", "such", "no", "nor", "not", "only", "own",
        "same", "so", "than", "too", "very", "just", "also", "now", "here",
        "there", "then", "once", "if", "because", "until", "while", "about",
        "into", "through", "during", "before", "after", "above", "below", "up",
        "down", "out", "off", "over", "under", "again", "further", "any", "your",
        "my", "his", "her", "our", "their", "them", "him", "me", "us", "get",
        "got", "like", "make", "made", "even", "still", "way", "well", "back",
        "being", "much", "many", "however", "although", "though", "since"
    );

    /**
     * Generate tags using TF-IDF algorithm
     * @param title Blog title
     * @param content Blog content
     * @param maxTags Maximum number of tags to return
     * @return Comma-separated tags
     */
    public String generateTags(String title, String content, int maxTags) {
        String fullText = (title + " " + title + " " + content).toLowerCase(); // Title weighted 2x
        
        // Tokenize and clean
        List<String> words = tokenize(fullText);
        
        if (words.isEmpty()) {
            return "";
        }
        
        // Calculate TF for each word
        Map<String, Double> tfScores = calculateTF(words);
        
        // Calculate IDF (using word frequency in document as proxy for rarity)
        Map<String, Double> idfScores = calculateIDF(words);
        
        // Calculate TF-IDF scores
        Map<String, Double> tfidfScores = new HashMap<>();
        for (String word : tfScores.keySet()) {
            double tfidf = tfScores.get(word) * idfScores.getOrDefault(word, 1.0);
            tfidfScores.put(word, tfidf);
        }
        
        // Sort by TF-IDF score and get top tags
        List<String> tags = tfidfScores.entrySet().stream()
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(maxTags)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
        
        return String.join(", ", tags);
    }

    /**
     * Tokenize text into words
     */
    private List<String> tokenize(String text) {
        // Remove special characters, keep only letters and spaces
        String cleaned = text.replaceAll("[^a-zA-Z\\s]", " ");
        
        // Split into words and filter
        return Arrays.stream(cleaned.split("\\s+"))
            .map(String::toLowerCase)
            .map(this::simpleStem) // Simple stemming
            .filter(word -> word.length() > 3) // Min length 4
            .filter(word -> !STOP_WORDS.contains(word))
            .filter(word -> !word.matches(".*\\d.*")) // No numbers
            .collect(Collectors.toList());
    }

    /**
     * Simple stemming - remove common suffixes
     */
    private String simpleStem(String word) {
        if (word.endsWith("ing") && word.length() > 5) {
            return word.substring(0, word.length() - 3);
        }
        if (word.endsWith("ed") && word.length() > 4) {
            return word.substring(0, word.length() - 2);
        }
        if (word.endsWith("ly") && word.length() > 4) {
            return word.substring(0, word.length() - 2);
        }
        if (word.endsWith("ies") && word.length() > 4) {
            return word.substring(0, word.length() - 3) + "y";
        }
        if (word.endsWith("es") && word.length() > 4) {
            return word.substring(0, word.length() - 2);
        }
        if (word.endsWith("s") && word.length() > 4 && !word.endsWith("ss")) {
            return word.substring(0, word.length() - 1);
        }
        return word;
    }

    /**
     * Calculate Term Frequency (TF)
     * TF = (count of term in document) / (total terms in document)
     */
    private Map<String, Double> calculateTF(List<String> words) {
        Map<String, Long> wordCounts = words.stream()
            .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
        
        int totalWords = words.size();
        Map<String, Double> tf = new HashMap<>();
        
        for (Map.Entry<String, Long> entry : wordCounts.entrySet()) {
            tf.put(entry.getKey(), (double) entry.getValue() / totalWords);
        }
        
        return tf;
    }

    /**
     * Calculate Inverse Document Frequency (IDF)
     * For single document: use inverse frequency as weight
     * Words appearing less frequently get higher scores
     */
    private Map<String, Double> calculateIDF(List<String> words) {
        Map<String, Long> wordCounts = words.stream()
            .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
        
        int totalUniqueWords = wordCounts.size();
        Map<String, Double> idf = new HashMap<>();
        
        for (Map.Entry<String, Long> entry : wordCounts.entrySet()) {
            // IDF approximation: log(total unique / frequency)
            // Words appearing more times get lower IDF (they're common)
            double idfScore = Math.log((double) totalUniqueWords / entry.getValue()) + 1;
            idf.put(entry.getKey(), idfScore);
        }
        
        return idf;
    }
}

