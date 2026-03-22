export type Template =
  {
      id: string;
      name: string;
      type: "soft" | "hard";
      scenePrompt: string;
      size?: "1024x1024" | "1536x1024" | "1024x1536";
      quality?: "low" | "medium" | "high" | "auto";
    };