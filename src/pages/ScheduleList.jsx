import React, { useEffect, useState } from "react";
import { scheduleAPI } from "../services/api";
import { toast } from "react-toastify";

// ✅ IST time formatter
const formatDateTimeIST = (utcDateStr) => {
  const date = new Date(utcDateStr);

  const dateStr = date.toLocaleDateString("en-IN", {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const timeStr = date.toLocaleTimeString("en-IN", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { dateStr, timeStr };
};

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchName, setSearchName] = useState("");

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await scheduleAPI.getAll();
      setSchedules(res.data);
    } catch (error) {
      toast.error("Failed to fetch schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getStatus = (date) => {
    const scheduleDate = new Date(date).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    if (scheduleDate === today) return "Live";
    return scheduleDate > today ? "Upcoming" : "Expired";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Live":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "Upcoming":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Expired":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?"))
      return;
    try {
      await scheduleAPI.deleteSchedule(id);
      toast.success("Schedule deleted successfully");
      fetchSchedules();
    } catch (error) {
      toast.error("Failed to delete schedule");
    }
  };

  const resetFilters = () => {
    setSearchName("");
    setFromDate("");
    setToDate("");
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date).toISOString().split("T")[0];
    const matchesName = schedule.customerId?.companyName
      ?.toLowerCase()
      .includes(searchName.toLowerCase());
    const withinRange =
      (!fromDate || scheduleDate >= fromDate) &&
      (!toDate || scheduleDate <= toDate);
    return matchesName && withinRange;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            📅 Schedule Management
          </h1>
          <p className="text-gray-300">
            Manage and monitor your poster schedules
          </p>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">🔍</span>
            Filter Schedules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search customer..."
                className="w-full p-3 rounded-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/10 text-white border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                🔄 Reset
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading schedules...</p>
            </div>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-12 text-center">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No Schedules Found
              </h3>
              <p className="text-gray-300">
                Try adjusting your search filters or create a new schedule.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-white">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-left font-semibold">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">Date</th>
                    <th className="px-6 py-4 text-left font-semibold">Time</th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => {
                    const { dateStr, timeStr } = formatDateTimeIST(
                      schedule.date
                    );
                    const status = getStatus(schedule.date);
                    return (
                      <tr
                        key={schedule._id}
                        className={`border-b border-white/5 hover:bg-white/5 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white/[0.02]" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium">
                            {schedule.customerId?.companyName || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                            {schedule.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {schedule.date}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {schedule.time}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 font-medium"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {filteredSchedules.map((schedule) => {
                const { dateStr, timeStr } = formatDateTimeIST(schedule.date);
                const status = getStatus(schedule.date);
                return (
                  <div
                    key={schedule._id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg">
                          {schedule.customerId?.companyName || "N/A"}
                        </h3>
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                          {schedule.category}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                          status
                        )}`}
                      >
                        {schedule.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-400">Date:</span>
                        <p className="text-white font-medium">
                          {schedule.date}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Time:</span>
                        <p className="text-white font-medium">
                          {schedule.time}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-all duration-200 text-sm font-medium"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
