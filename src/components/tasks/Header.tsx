"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { logout } from "@/lib/features/authSlice";
import { BsCaretDown } from "react-icons/bs";

const Header = () => {
  const dispatch = useDispatch();
  const username = useSelector((state: RootState) => state.auth.username);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-purple-800 text-white shadow-md z-50 ">
      <div className="px-15 mx-auto py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Handler</h1>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 focus:outline-none text-black cursor-pointer py-1 px-1 bg-white rounded-lg shadow-sm hover:scale-105"
          >
            {username}
            <BsCaretDown />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg overflow-hidden">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-gray-200"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
