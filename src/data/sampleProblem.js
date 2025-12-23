/**
 * Sample problem data following the Scaffolded Learning data model.
 * Each problem is split into multiple steps (a Directed Acyclic Graph).
 * Users must solve Step 1 before seeing Step 2.
 */
export const sampleProblem = {
  id: "problem_101",
  title: "Detect Cycle in Linked List",
  difficulty: "Medium",
  description: "Given a linked list, determine if it has a cycle in it. A cycle occurs when a node's next pointer points back to a previous node, creating a loop.",
  steps: [
    {
      stepId: 1,
      instruction: "First, we need to initialize our pointers. Create a 'slow' pointer and a 'fast' pointer, both pointing to the head. This is the foundation of Floyd's Tortoise and Hare algorithm.",
      placeholderCode: "# Initialize your pointers here\nslow = \nfast = ",
      validationType: "regex",
      validationRule: "(slow\\s*=\\s*head).*(fast\\s*=\\s*head)|(fast\\s*=\\s*head).*(slow\\s*=\\s*head)",
      hints: [
        "Think about the Tortoise and Hare algorithm.",
        "Both pointers should start at the same position - the head of the linked list.",
        "Example: slow = head"
      ]
    },
    {
      stepId: 2,
      instruction: "Now, create a while loop. It should run as long as 'fast' and 'fast.next' are not None. This ensures we don't get a null pointer error when moving the fast pointer.",
      placeholderCode: "while ... :\n    # Loop body will go here",
      validationType: "regex",
      validationRule: "while\\s+fast\\s+(and|&&)\\s+fast\\.next",
      hints: [
        "We need to make sure the fast pointer doesn't run off the end of the list.",
        "Check both 'fast' and 'fast.next' are not None.",
        "Use 'and' to combine the two conditions."
      ]
    },
    {
      stepId: 3,
      instruction: "Inside the loop, move the slow pointer by one step and the fast pointer by two steps. This is the key to detecting cycles - if there's a cycle, the fast pointer will eventually catch up to the slow pointer.",
      placeholderCode: "# Move the pointers\nslow = \nfast = ",
      validationType: "regex",
      validationRule: "(slow\\s*=\\s*slow\\.next).*(fast\\s*=\\s*fast\\.next\\.next)|(fast\\s*=\\s*fast\\.next\\.next).*(slow\\s*=\\s*slow\\.next)",
      hints: [
        "The slow pointer moves one node at a time: slow = slow.next",
        "The fast pointer moves two nodes at a time: fast = fast.next.next",
        "Think of it like two runners on a circular track - the faster one will lap the slower one if it's circular."
      ]
    },
    {
      stepId: 4,
      instruction: "After moving the pointers, check if they meet. If slow equals fast, we've detected a cycle! Return True in this case.",
      placeholderCode: "# Check for cycle\nif ...:\n    return True",
      validationType: "regex",
      validationRule: "if\\s+slow\\s*(==|is)\\s*fast",
      hints: [
        "Compare the two pointers using '==' or 'is'.",
        "If they point to the same node, we found a cycle.",
        "This check should be inside the while loop."
      ]
    },
    {
      stepId: 5,
      instruction: "Finally, if the loop completes without finding a cycle (fast reaches the end), return False. This means the linked list has no cycle.",
      placeholderCode: "# No cycle found\nreturn ...",
      validationType: "regex",
      validationRule: "return\\s+False",
      hints: [
        "If we exit the while loop, it means fast reached the end.",
        "A list that ends (has a None) cannot have a cycle.",
        "Simply return False."
      ]
    }
  ]
};

export default sampleProblem;
