# CatMapperJS Test Overview

Last reviewed: February 18, 2026

This folder currently has 8 automated frontend test suites with 33 total checks.  
The goal of these tests is to make sure major pages render, mobile layout stays usable, admin workflows function, and translate-review behavior stays stable.

## Current Test Suites

- `tests/homePage.spec.js` (1 check): Confirms the home page loads and shows key hero content.
- `tests/exploreTable.spec.js` (1 check): Verifies core action buttons appear in the Explore table.
- `tests/mainRoutes.smoke.spec.js` (5 checks): Confirms key pages (home, explore, translate, merge) render for each main database route.
- `tests/mobileLayout.spec.js` (2 checks): Verifies mobile pages do not overflow horizontally and that mobile navigation appears where expected.
- `tests/adminMetadata.spec.js` (2 checks): Confirms admins can browse grouped metadata and save edits through the expected flow.
- `tests/translateReviewWorkflow.spec.js` (1 check): Runs a full translate-review journey (remove/replace/resolve/export), including bookmark insertion and row-selection reset behavior after updates.
- `src/api/profileApi.test.js` (4 checks): Verifies profile-related API calls normalize older payload formats and hit the expected endpoints.
- `src/utils/translateReview.test.js` (17 checks): Confirms translate-review helper logic handles IDs, grouped matches, row updates, selection-model normalization, cleanup, and summary percentages consistently.

## Notes

- This summary reflects active automated suites in `tests/*.spec.js` and `src/**/*.test.js`.
