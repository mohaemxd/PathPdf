
import { RoadmapData } from "@/lib/gemini";

// Sample roadmap data
export const sampleRoadmap: RoadmapData = {
  title: "Java Programming",
  rootNode: {
    id: "node-1",
    title: "Java",
    description: "Java is a high-level, class-based, object-oriented programming language.",
    children: [
      {
        id: "node-2",
        title: "Java Basics",
        description: "Fundamental concepts in Java programming.",
        children: [
          {
            id: "node-2-1",
            title: "Syntax",
            description: "Basic rules for writing Java code.",
            children: []
          },
          {
            id: "node-2-2",
            title: "Variables",
            description: "How to declare and use variables in Java.",
            children: []
          }
        ]
      },
      {
        id: "node-3",
        title: "Data Types",
        description: "Types of data and their operations in Java.",
        children: [
          {
            id: "node-3-1",
            title: "Primitive Types",
            description: "Basic data types in Java.",
            children: []
          },
          {
            id: "node-3-2",
            title: "Reference Types",
            description: "Complex data types in Java.",
            children: []
          }
        ]
      },
      {
        id: "node-4",
        title: "OOP Concepts",
        description: "Object-Oriented Programming concepts in Java.",
        children: [
          {
            id: "node-4-1",
            title: "Classes & Objects",
            description: "Creating and using classes and objects.",
            children: []
          },
          {
            id: "node-4-2",
            title: "Inheritance",
            description: "Extending classes in Java.",
            children: []
          },
          {
            id: "node-4-3",
            title: "Polymorphism",
            description: "Methods behaving differently based on context.",
            children: []
          }
        ]
      }
    ]
  }
};
