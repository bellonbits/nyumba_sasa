import { Card, Skeleton } from "antd";

export default function PropertyCardSkeleton() {
  return (
    <Card
      className="overflow-hidden"
      cover={<div className="h-48 bg-gray-200 animate-pulse" />}
      styles={{ body: { padding: "12px 14px" } }}
    >
      <Skeleton active paragraph={{ rows: 2 }} title={{ width: "70%" }} />
    </Card>
  );
}
