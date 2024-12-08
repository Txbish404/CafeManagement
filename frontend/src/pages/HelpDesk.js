import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from "../components/theme-provider"; 
import { useToast } from '../components/ui/use-toast';
import { Toast } from '../components/ui/toast';

function HelpDesk() {
  const [tickets, setTickets] = useState([]);
  const [reply, setReply] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { theme } = useTheme(); // Get the current theme
  const { toast, showToast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/staff/help-desk/tickets');
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:5000/api/staff/help-desk/tickets/${selectedTicket._id}/reply`, { reply });
      setReply('');
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      console.error('Error replying to ticket:', error);
    }
    showToast({
      title: "Reply Sent"
    });
  };

  const handleClose = () => {
    setSelectedTicket(null); // Close the reply section
    setReply(''); // Clear the reply text
  };

  return (
    <div className={`p-6 ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <h1 className={`text-3xl font-bold mb-4 ${theme === "dark" ? "text-white" : "text-black"}`}>
        Help Desk
      </h1>
      <div className="mb-6">
        <h2 className={`text-2xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-black"}`}>
          Open Tickets
        </h2>
        <ul className={`border rounded-lg ${theme === "dark" ? "bg-gray-800" : "bg-gray-100"} shadow-md`}>
          {tickets.map(ticket => (
            <li 
              key={ticket._id} 
              onClick={() => setSelectedTicket(ticket)}
              className={`p-4 border-b last:border-b-0 cursor-pointer ${theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-200"} transition-colors duration-200`}
            >
              <span className={`font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>{ticket.subject}</span> - 
              <span className={`${ticket.status === 'Open' ? 'text-green-500' : 'text-red-500'}`}>{ticket.status}</span>
            </li>
          ))}
        </ul>
      </div>
      {selectedTicket && (
        <div className="relative border rounded-lg p-4 shadow-md bg-gray-100">
          {/* Close Cross Icon */}
          <span 
            onClick={handleClose} 
            className={`absolute top-2 right-2 cursor-pointer ${theme === "dark" ? "text-gray-300 hover:text-white" : "text-gray-600 hover:text-black"}`}
            aria-label="Close"
          >
            &times; {/* You can replace this with an SVG icon if desired */}
          </span>
          <h3 className={`text-xl font-semibold ${theme === "dark" ? "text-blue-400" : "text-blue-600"}`}>
            {selectedTicket.subject}
          </h3>
          <p className={`my-2 ${theme === "dark" ? "text-gray-300" : "text-gray-800"}`}>
            {selectedTicket.message}
          </p>
          <form onSubmit={handleReply}>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Enter your reply"
              required
              className={`w-full p-2 border rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"} mb-2`}
            ></textarea>
            <button 
              type="submit" 
              className={`w-full py-2 rounded-lg ${theme === "dark" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}
            >
              Send Reply
            </button>
          </form>
        </div>
 )}
       <Toast toast={toast} />

    </div>
  );
}

export default HelpDesk;