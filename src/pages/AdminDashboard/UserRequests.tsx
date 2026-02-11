import { useEffect, useState } from "react";
import { RefreshCw, FileDown } from "lucide-react";
import { toast } from "react-toastify";
import { apiService } from "../../services/api";

const UserRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token") || "";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiService.getRequests(token);
      setRequests(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user requests");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">User Requests</h1>

        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {loading && <p className="text-gray-400">Loading...</p>}

      {/* Empty */}
      {!loading && requests.length === 0 && (
        <p className="text-gray-400">No user requests found</p>
      )}

      {/* Table */}
      {!loading && requests.length > 0 && (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="min-w-full bg-[#0a1b30]/40 border-collapse">
            <thead className="bg-[#0d223c] text-gray-300 uppercase text-sm">
              <tr>
                <th className="py-3 px-4 text-left">Full Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Company</th>
                <th className="py-3 px-4 text-left">Description</th>
                <th className="py-3 px-4 text-left">Created</th>
                <th className="py-3 px-4 text-left">File</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((req, i) => (
                <tr
                  key={req.id}
                  className={`border-t border-white/10 ${
                    i % 2 === 0 ? "bg-[#0a1b30]/20" : "bg-[#0a1b30]/40"
                  }`}
                >
                  <td className="py-3 px-4">{req.full_name}</td>
                  <td className="py-3 px-4 text-gray-300">{req.email}</td>
                  <td className="py-3 px-4">{req.company_name}</td>

                  <td
                    className="py-3 px-4 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap"
                    title={req.description}
                  >
                    {req.description}
                  </td>

                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {formatDate(req.created_at)}
                  </td>

                  <td className="py-3 px-4">
                    {req.file ? (
                      <a
                        href={`https://${req.file}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-xs w-max"
                      >
                        <FileDown size={14} />
                        Download
                      </a>
                    ) : (
                      <span className="text-gray-500 text-sm">No file</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserRequests;
