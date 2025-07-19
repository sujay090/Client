import React, { useEffect, useState } from 'react';
import { scheduleAPI } from '../services/api';
import { toast } from 'react-toastify';

// ✅ IST time formatter
const formatDateTimeIST = (utcDateStr) => {
  const date = new Date(utcDateStr);

  const dateStr = date.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString('en-IN', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return { dateStr, timeStr };
};

const ScheduleList = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchName, setSearchName] = useState('');

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await scheduleAPI.getAll();
      setSchedules(res.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const getStatus = (date) => {
    const scheduleDate = new Date(date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    if (scheduleDate === today) return 'Live';
    return scheduleDate > today ? 'Upcoming' : 'Expired';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Live':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expired':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await scheduleAPI.deleteSchedule(id);
      toast.success('Schedule deleted successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  const resetFilters = () => {
    setSearchName('');
    setFromDate('');
    setToDate('');
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date).toISOString().split('T')[0];
    const matchesName = schedule.customerId?.companyName?.toLowerCase().includes(searchName.toLowerCase());
    const withinRange =
      (!fromDate || scheduleDate >= fromDate) &&
      (!toDate || scheduleDate <= toDate);
    return matchesName && withinRange;
  });

  return (
    <div className="min-h-screen p-6 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Schedules</h1>

      {/* Filter controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300">Customer Name</label>
          <input
            type="text"
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            placeholder="Search customer"
            className="mt-1 p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="mt-1 p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="mt-1 p-2 rounded bg-gray-800 text-white border border-gray-600"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={resetFilters}
            className="mt-5 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            Reset
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredSchedules.length === 0 ? (
        <p>No schedules found.</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm text-white border border-gray-600">
            <thead>
              <tr className="bg-gray-800">
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule) => {
                const { dateStr, timeStr } = formatDateTimeIST(schedule.date);
                const status = getStatus(schedule.date);
                return (
                  <tr key={schedule._id} className="border-t border-gray-700 hover:bg-gray-800">
                    <td className="px-4 py-2">{schedule.customerId?.companyName || 'N/A'}</td>
                    <td className="px-4 py-2">{schedule.category}</td>
                    <td className="px-4 py-2">{schedule.date}</td>
                    <td className="px-4 py-2">{schedule.time}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full border ${getStatusClass(status)}`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleDelete(schedule._id)}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScheduleList;

