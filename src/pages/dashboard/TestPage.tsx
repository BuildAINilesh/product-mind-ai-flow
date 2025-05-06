import React from "react";

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Test Page</h1>
      <p>If you can see this page, React routing is working correctly.</p>
      <div>
        <h2>Debug Information</h2>
        <ul>
          <li>Path: {window.location.pathname}</li>
          <li>URL: {window.location.href}</li>
          <li>React version: {React.version}</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
