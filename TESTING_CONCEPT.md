# Genetix Webapp Test Concept

This test concept outlines the testing approach for a web application written in JavaScript. The goal of this testing is to ensure the application meets functional requirements, is user-friendly, and works seamlessly across different devices and platforms.
Testing Types

The following testing types will be used for this web application:

## Automatic tests

1. **Unit Testing:** Unit tests make sure the individual parts of the app are working as intended

1. **Integration Testing:** Integration tests do test how the different parts interact with each other

## Manual tests

1. **Functional Testing:** Testing if the app fulfills all the required functionality

1. **Compatibility Testing:** These tests check if there are any compatibility issues between platforms, browsers etc



## Test Plan

The following is a high-level test plan for the web application:

1. **Unit Testing**
   - Public methods (i.e. everything with a programmable interface) must be tested
   - The following must be tested each time:
     - Positive test cases
     - Negative test cases
     - Edge cases (for example values at which numbers roll over)
   - All automatic tests must be called with `npm test` so the CI/CD Pipeline can run it

1. **Integration Testing**
   - Every part that interacts with other parts of the app must be tested with integration tests
   - The following must be tested each time:
     - Positive test cases
     - Negative test cases
     - Edge cases (for example values at which numbers roll over)
   - All automatic tests must be called with `npm test` so the CI/CD Pipeline can run it

1. **Functional Testing**
   - The functional requirements can be found in the Software Guidebook
   - At least two testers must test each requirement manually and write down their findings
   - The following must be tested each time:
       - Positive test cases
       - Negative test cases
       - Edge cases (for example what happens if you input an absurdly large number?)

1. **Compatibility Testing**
   - The compatibility requirements can be found in the Software Guidebook
   - At least two testers must test each requirement manually and write down their findings
   - The following must be tested each time:
       - Positive test cases
       - Negative test cases
       - Edge cases (for example what happens if you input an absurdly large number?)   



## Test Environment

The following environment will be used for testing:

### Automatic testing

A CI/CD pipeline has been set up and will run the tests automatically.

It can be found here: [automatic-tests.yml](.github/workflows/automatic-tests.yml)

### Manual testing
Each tester does this on their own machine which means it will be easy to also do compatibility testing at the same time by comparing results with each other

    Operating Systems: Windows 10, Windows 11, Manjaro Linux
    Browsers: Google Chrome, Mozilla Firefox, Microsoft Edge
    Devices: Desktop, laptop, tablet, and smartphones


## Test Execution

Automatic tests will be executed on each merge onto the dev branch.

Manual tests will be executed after all features have been implemented.

## Test Deliverables

The following deliverables will be produced as part of the testing process:

    Test Plan
    Test Cases and Execution
    Defect Report

## Test Criteria

The following criteria will be used to evaluate the success of testing:

    All automatic test cases complete with a success.
    The application meets all functional requirements.
    The application works seamlessly across different devices and platforms.
    All defects have been identified and resolved.

# Templates
The following section contains templates for some of the deliverables mentioned above so testers can simply copy them for their own testing.

## Test cases and execution report
| ID  | Title | Description | Test Steps | Test Case Owner | Test Execution Date | Test Executed By | Expected Results | Actual Results | Pass/Fail | Remarks |
|-----|-------|-------------|------------|-----------------|---------------------|------------------|------------------|----------------|-----------|---------|
|     |       |             |            |                 |                     |                  |                  |                |           |         |
|     |       |             |            |                 |                     |                  |                  |                |           |         |

## Defect report

| Test Case ID | Title | Description | Severity | Priority | Defect Status | Defect Found Date | Defect Found By | GitHub Issue Number | Remarks |
|--------------|-------|-------------|----------|----------|---------------|-------------------|-----------------|---------------------|---------|
|              |       |             |          |          |               |                   |                 |                     |         |
|              |       |             |          |          |               |                   |                 |                     |         |