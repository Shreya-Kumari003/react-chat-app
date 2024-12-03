import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useAppStore } from "@/store";
import { RiCloseFill } from "react-icons/ri";
import { getColor } from "@/lib/utils";
import { HOST } from "@/utils/constants";

const ChatHeader = () => {
  const { closeChat, selectedChatData, selectedChatType } = useAppStore();

  return (
    <div className="h-[10vh] bg-gray-300/40 border-b-2 border-[#2f303b] flex items-center justify-between lg:px-20 xl:px-5 sm:px-2">
      <div className="flex gap-5 items-center w-full justify-between sm:justify-start sm:px-1">
        {/* Avatar and Chat Info */}
        <div className="flex gap-3 items-center sm:w-full">
          <div className="w-12 h-12 relative">
            {selectedChatType === "contact" ? (
              <Avatar className="h-12 w-12 rounded-full overflow-hidden lg:pl-0 pl-1">
                {selectedChatData.image ? (
                  <AvatarImage
                    src={selectedChatData.image}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                      selectedChatData.color
                    )}`}
                  >
                    {selectedChatData.firstName
                      ? selectedChatData.firstName.charAt(0)
                      : selectedChatData.email.charAt(0)}
                  </div>
                )}
              </Avatar>
            ) : (
              <div className="bg-[#ffffff22] h-12 w-12 flex items-center justify-center rounded-full text-black text-lg">
                #
              </div>
            )}
          </div>
          {/* Chat Name or Email */}
          <div className="text-black/70 font-poppins font-bold">
            {selectedChatType === "channel" && selectedChatData.name}
            {selectedChatType === "contact" && selectedChatData.firstName
              ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
              : selectedChatData.email}
          </div>
        </div>
        {/* Close Button */}
        <div className="flex items-center justify-center sm:justify-start gap-5 pr-3">
          <button
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
            onClick={closeChat}
          >
            <RiCloseFill className="text-3xl text-black" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
