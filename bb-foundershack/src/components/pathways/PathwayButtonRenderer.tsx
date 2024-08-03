import React from 'react'

type Node = {
    name: string;
    type: "skills" | "subTopics" | "topics";
    threshold: number;
    difficulty: string;
    year_level: string;
    index: number;
    isLocked: boolean;
    current: boolean;
    correctAnswers?: number;
  };
  type TopicMap = Record<string, number>;
  
  type Props = {
    initialNodes: Node[];
    currentTopicIndex: number;
    currentQuestionIndex: number;
    topicMap: TopicMap;
    userPathwayId: string;
    onLoadComplete: () => void; // New prop for callback
  };
const PathwayButtonRenderer = (props: Props) => {
  return (
    <div>PathwayButtonRenderer</div>
  )
}

export default PathwayButtonRenderer