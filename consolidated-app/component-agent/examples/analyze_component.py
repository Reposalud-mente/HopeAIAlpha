"""
Example: Analyze Component

This example demonstrates how to use the component agent to analyze a React component.
"""

import os
import sys
import traceback
from pathlib import Path

# Add the parent directory to the Python path
sys.path.append(str(Path(__file__).parent.parent))

from component_agent import ComponentAgent

# Sample React component to analyze
SAMPLE_COMPONENT = """
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserProfileProps {
  userId: string;
  showDetails?: boolean;
  onUpdate?: (user: User) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export function UserProfile({ userId, showDetails = true, onUpdate }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        const userData = await response.json();
        setUser(userData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId]);

  const handleUpdateRole = async (newRole: 'admin' | 'user') => {
    if (!user) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);

      if (onUpdate) {
        onUpdate(updatedUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  if (loading) {
    return <div>Loading user profile...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p>Email: {user.email}</p>
          {showDetails && (
            <>
              <p>Role: {user.role}</p>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateRole(user.role === 'admin' ? 'user' : 'admin')}
                >
                  {user.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
"""

def main():
    try:
        # Initialize the component agent
        agent = ComponentAgent()

        # Analyze the component
        analysis = agent.analyze_component(
            SAMPLE_COMPONENT,
            {
                "accessibility": True,
                "performance": True,
                "bestPractices": True
            }
        )

        # Print the analysis results
        print("Component Analysis Results:")
        print("==========================")
        print(f"Component Name: {analysis.get('name', 'Unknown')}")
        print(f"Component Type: {analysis.get('type', 'Unknown')}")

        print("\nProps:")
        for prop in analysis.get("props", []):
            print(f"- {prop.get('name', '')}: {prop.get('type', '')}")

        print("\nState:")
        for state in analysis.get("state", []):
            print(f"- {state.get('name', '')}: {state.get('type', '')}")

        print("\nHooks:")
        for hook in analysis.get("hooks", []):
            print(f"- {hook.get('name', '')}: {hook.get('type', '')}")

        print("\nIssues:")
        for issue in analysis.get("issues", []):
            print(f"- [{issue.get('severity', 'info')}] {issue.get('message', '')}")

        print("\nSuggestions:")
        for suggestion in analysis.get("suggestions", []):
            print(f"- {suggestion.get('message', '')}")

        # If there's a raw response, print it
        if "raw_response" in analysis:
            print("\nRaw Response:")
            print(analysis["raw_response"])
    except Exception as e:
        print(f"Error analyzing component: {str(e)}")
        print("\nTraceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
