import { useState, useEffect, useContext } from "react";
import { Box, styled, Divider } from "@mui/material";

import { AccountContext } from "../../../context/AccountProvider";

// components
import Conversation from "./Converesation";
import { getUsers } from "../../../service/api";

const Component = styled(Box)`
  overflow: overlay;
  height: 81vh;
`;

const StyledDivider = styled(Divider)`
  margin: 0 0 0 70px;
  background-color: #e9edef;
  opacity: 0.6;
`;

const Conversations = ({ text }) => {
  const [users, setUsers] = useState([]);
  const { account, socket, setActiveUsers } = useContext(AccountContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let data = await getUsers();

        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.warn("getUsers() did not return an array:", data);
          setUsers([]);
          return;
        }

        // Filter safely
        let filteredData = data.filter((user) =>
          user?.name?.toLowerCase().includes(text.toLowerCase())
        );

        setUsers(filteredData);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setUsers([]);
      }
    };

    fetchData();
  }, [text]);

  useEffect(() => {
    if (!socket?.current) return;

    socket.current.emit("addUser", account);
    socket.current.on("getUsers", (usersList) => {
      setActiveUsers(usersList || []);
    });
  }, [account, socket, setActiveUsers]);

  return (
    <Component>
      {users.map((user, index) =>
        user?.sub !== account?.sub ? (
          <Box key={user.sub}>
            <Conversation user={user} />
            {users.length !== index + 1 && <StyledDivider />}
          </Box>
        ) : null
      )}
    </Component>
  );
};

export default Conversations;
