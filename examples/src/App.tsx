import React, { useState } from "react";

import { PlanetStar, type User } from "@lucky-boy/planet-star";

export default function App() {
  const [view, setView] = useState<"lottery" | "planet" | "star">("lottery");

  // Generate some mock data for demonstration
  const mockUsers = React.useMemo(() => {
    const users: User[] = [];
    const count = 20971;
    const startId = 15587772722;
    const avatarUrl = "https://gw.alipayobjects.com/mdn/rms_47f090/afts/img/A*ti0gQIRkBd0AAAAAAAAAAAAAARQnAQ";

    for (let i = 0; i < count; i++) {
      users.push({
        id: (startId + i).toString(),
        name: `藏品${i + 1}`,
        avatarUrl: avatarUrl
      });
    }
    return users;
  }, []);

  // Simulate a promise that fetches users
  const usersPromise = React.useMemo(() => {
    return new Promise<User[]>((_resolve, reject) => {
      console.log("Start fetching users...");
      setTimeout(() => {
        debugger;
        // Scenario 1: Success
        // _resolve(mockUsers);
        // _resolve(mockUsers);
        // Scenario 2: Failure (Trigger fallback to demoUsers)
        reject(new Error("Simulated network error"));
      }, 2000);
    });
  }, [mockUsers]);

  return (
    <React.Fragment>
      {/* @ts-ignore */}
      <PlanetStar users={usersPromise} demoUsers={mockUsers} />
    </React.Fragment>
  );
}
