"use client";

import Link from "next/link";
import Image from "next/image";
import { Empty, Badge, Avatar } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { formatDate, getInitials, truncate } from "@/lib/utils";

interface MessagesClientProps {
  conversations: any[];
  currentUserId: string;
}

export default function MessagesClient({ conversations, currentUserId }: MessagesClientProps) {
  return (
    <div className="min-h-screen bg-white" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
      <div className="px-4 pt-12 pb-3 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-400 text-sm mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? "s" : ""}</p>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
            <MessageOutlined className="text-[#FF6A00] text-2xl" />
          </div>
          <p className="font-semibold text-gray-700">No messages yet</p>
          <p className="text-sm text-gray-400 mt-1">Contact an agent on a listing to start chatting</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {conversations.map((conv) => {
            const other = conv.sender_id === currentUserId ? conv.receiver : conv.sender;
            const isUnread = !conv.is_read && conv.receiver_id === currentUserId;
            const listingImage = conv.listing?.images?.[0];

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.listing_id}?partner=${other?.id}`}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                {/* Listing thumbnail */}
                <div className="relative h-14 w-14 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                  {listingImage && (
                    <Image src={listingImage} alt="" fill className="object-cover" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm ${isUnread ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                      {other?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(conv.created_at)}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{conv.listing?.title ?? ""}</p>
                  <p className={`text-sm truncate mt-0.5 ${isUnread ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                    {conv.sender_id === currentUserId ? "You: " : ""}
                    {truncate(conv.text, 42)}
                  </p>
                </div>

                {isUnread && <Badge dot style={{ background: "#FF6A00" }} />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
