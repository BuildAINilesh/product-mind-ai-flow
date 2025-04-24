
export interface TestCase {
  id: string;
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
}

export interface TestCases {
  functional: TestCase[];
  integration: TestCase[];
  user: TestCase[];
}

// Sample predefined test cases
export const mockTestCases: TestCases = {
  functional: [
    {
      id: "TC001",
      title: "User Login Validation",
      description: "Verify that a user can login with valid credentials",
      steps: [
        "Navigate to login page",
        "Enter valid username and password",
        "Click the login button"
      ],
      expectedResult: "User is authenticated and redirected to dashboard"
    },
    {
      id: "TC002",
      title: "Invalid Login Attempt",
      description: "Verify that appropriate error message is shown for invalid login",
      steps: [
        "Navigate to login page",
        "Enter invalid username or password",
        "Click the login button"
      ],
      expectedResult: "Error message is displayed and user remains on login page"
    },
    {
      id: "TC003",
      title: "Password Reset",
      description: "Verify that a user can reset their password",
      steps: [
        "Navigate to login page",
        "Click 'Forgot Password' link",
        "Enter registered email",
        "Submit request"
      ],
      expectedResult: "Password reset confirmation message is shown"
    }
  ],
  integration: [
    {
      id: "TC004",
      title: "API Authentication Flow",
      description: "Verify that authentication tokens are properly generated and validated",
      steps: [
        "Authenticate user via API endpoint",
        "Retrieve authentication token",
        "Use token to access protected resource"
      ],
      expectedResult: "Protected resource is accessible with valid token"
    },
    {
      id: "TC005",
      title: "Database Persistence",
      description: "Verify that user data is properly stored in the database",
      steps: [
        "Create new user via API",
        "Query database for user record"
      ],
      expectedResult: "User record exists in database with correct information"
    }
  ],
  user: [
    {
      id: "TC006",
      title: "Dashboard Navigation",
      description: "Verify that users can navigate through the dashboard interface",
      steps: [
        "Login to application",
        "Click on different navigation items",
        "Observe page transitions"
      ],
      expectedResult: "User can access all sections of the dashboard smoothly"
    },
    {
      id: "TC007",
      title: "Mobile Responsiveness",
      description: "Verify that the interface adapts correctly to mobile screen sizes",
      steps: [
        "Access application on mobile device",
        "Navigate through key workflows"
      ],
      expectedResult: "Interface is usable and properly formatted on mobile devices"
    }
  ]
};

// Generate test cases based on requirements
export const generateTestCasesFromRequirements = (requirementText: string): TestCases => {
  // In a real implementation, this would use AI or some logic to generate tests from requirements
  // For now, we'll return some sample test cases based on common requirements
  
  // Create test case IDs that look unique
  const randomId = () => "TC" + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return {
    functional: [
      {
        id: randomId(),
        title: "Feature Functionality Verification",
        description: "Verify that the main feature described in requirements works as expected",
        steps: [
          "Set up test environment",
          "Configure required parameters",
          "Execute the main function",
          "Verify results match expected output"
        ],
        expectedResult: "Feature produces correct output matching requirements"
      },
      {
        id: randomId(),
        title: "Edge Case Handling",
        description: "Verify system handles boundary conditions properly",
        steps: [
          "Identify boundary values from requirements",
          "Test with minimum valid input values",
          "Test with maximum valid input values",
          "Test with invalid input values"
        ],
        expectedResult: "System gracefully handles all edge cases with appropriate responses"
      }
    ],
    integration: [
      {
        id: randomId(),
        title: "Component Integration Test",
        description: "Verify components interact correctly as specified in requirements",
        steps: [
          "Initialize all dependent components",
          "Establish connections between components",
          "Trigger workflow through entire system",
          "Verify data flows correctly between components"
        ],
        expectedResult: "All components work together to fulfill requirements"
      }
    ],
    user: [
      {
        id: randomId(),
        title: "User Acceptance Criteria",
        description: "Verify the feature meets all user acceptance criteria",
        steps: [
          "Identify all user acceptance criteria from requirements",
          "Test each criterion individually",
          "Verify user workflows complete successfully"
        ],
        expectedResult: "All acceptance criteria are met and user workflows succeed"
      }
    ]
  };
};
