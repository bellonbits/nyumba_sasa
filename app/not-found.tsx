import Link from "next/link";
import { Button, Result } from "antd";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Result
        status="404"
        title={<span className="text-2xl font-bold text-gray-900">Page Not Found</span>}
        subTitle={<span className="text-gray-500">This page doesn't exist or was removed.</span>}
        extra={
          <Link href="/home">
            <Button type="primary" size="large" className="rounded-xl" style={{ background: "#FF6A00", borderColor: "#FF6A00" }}>
              Back to Home
            </Button>
          </Link>
        }
      />
    </div>
  );
}
