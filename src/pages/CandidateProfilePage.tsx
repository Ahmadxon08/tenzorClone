import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Heart,
  Share2,
  Download,
  FileText,
} from "lucide-react";

interface CandidateProfile {
  id: number;
  name: string;
  email: string;
  phonenumber: string;
  resume: string;
  score: number;
  description?: string;
  work_experience?: string;
  specialization?: string;
  employment_type?: string;
  work_format?: string;
  location?: string;
  company_name?: string;
  position_title?: string;
  vakansiya_title?: string;
  created_at: string;
  type?: string;
  education?: Array<{ muassasa: string; yo_nalish?: string }>;
  experience?: Array<{ muddat: string; lavozim: string; kompaniya: string }>;
  language?: Array<{ til: string; daraja: string }>;
}

const CandidateProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (token && id) {
      loadCandidateProfile();
    }
  }, [token, id]);

  const loadCandidateProfile = async () => {
    setError(null);
    try {
      // Make GET request to vakand/list?vakand_id={id}
      const response = await fetch(
        `https://ai.tenzorsoft.uz/vakand/list?vakand_id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch candidate: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Candidate API Response:", data);

      if (data && data.data) {
        const candidateData = Array.isArray(data.data) ? data.data[0] : data.data;
        const transformedCandidate: CandidateProfile = {
          id: candidateData.id || parseInt(id || "1"),
          name: candidateData.name || candidateData.candidate_name || "Unknown",
          email: candidateData.email || "",
          phonenumber: candidateData.phonenumber || candidateData.phone || "",
          resume: candidateData.resume || "",
          score: candidateData.score || 0,
          description: candidateData.description || candidateData.additional_data || "",
          work_experience: candidateData.work_experience || "",
          specialization: candidateData.specialization || "",
          employment_type: candidateData.employment_type || "",
          work_format: candidateData.work_format || "",
          location: candidateData.location || "",
          company_name: candidateData.company_name || "",
          position_title: candidateData.position_title || "",
          vakansiya_title: candidateData.vakansiya_title || "",
          created_at: candidateData.created_at || new Date().toISOString(),
          type: candidateData.type || "",
          education: candidateData.education || [],
          experience: candidateData.experience || [],
          language: candidateData.language || [],
        };
        setCandidate(transformedCandidate);
      }
    } catch (err) {
      console.error("Error loading candidate profile:", err);
      setError("Failed to load candidate profile");
    }
  };

  if (error || !candidate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300">
          {error || "Candidate not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Header Navigation */}
      <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Heart
                size={20}
                className={liked ? "fill-red-500 text-red-500" : "text-gray-400"}
                onClick={() => setLiked(!liked)}
              />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Share2 size={20} className="text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Download size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div>
          {/* Main Content */}
          <div>
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {candidate.name}
                  </h1>
                  <p className="text-xl text-blue-400 mb-4">
                    {candidate.vakansiya_title}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {candidate.location && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin size={18} className="text-blue-400" />
                        <span>{candidate.location}</span>
                      </div>
                    )}
                    {candidate.work_experience && (
                      <div className="flex items-center gap-2 text-gray-300">
                        <Briefcase size={18} className="text-blue-400" />
                        <span>Experience: {candidate.work_experience}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-2">
                    <span className="text-2xl font-bold text-white">
                      {candidate.score}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Assessment Score</p>
                </div>
              </div>
            </div>

            {/* Job Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {candidate.specialization && (
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Specialization</p>
                  <p className="text-white font-medium">
                    {candidate.specialization}
                  </p>
                </div>
              )}
              {candidate.employment_type && (
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-2">Employment Type</p>
                  <p className="text-white font-medium">
                    {candidate.employment_type}
                  </p>
                </div>
              )}
              {candidate.work_format && (
                <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-4 md:col-span-2">
                  <p className="text-gray-400 text-sm mb-2">Work Format</p>
                  <p className="text-white font-medium">{candidate.work_format}</p>
                </div>
              )}
            </div>

            {/* About Section */}
            <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {candidate.description || 'No data available.'}
                </p>
              </div>
            </div>

            {/* Resume Section */}
            {candidate.resume && (
              <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Resume</h2>
                <a
                  href={`https://s3.tenzorsoft.uz/s3-tenzorsoft/${candidate.resume}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <FileText size={18} />
                  Review Resume
                </a>
              </div>
            )}

            {/* Education Section */}
            {candidate.education && candidate.education.length > 0 && (
              <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Education</h2>
                <div className="space-y-3">
                  {candidate.education.map((edu, index) => (
                    <div key={index} className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-4">
                      <p className="text-white font-medium">{edu.muassasa}</p>
                      {edu.yo_nalish && (
                        <p className="text-gray-400 text-sm mt-1">{edu.yo_nalish}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {candidate.experience && candidate.experience.length > 0 && (
              <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Experience</h2>
                <div className="space-y-3">
                  {candidate.experience.map((exp, index) => (
                    <div key={index} className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-medium">{exp.lavozim}</p>
                        <span className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                          {exp.muddat}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{exp.kompaniya}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages Section */}
            {candidate.language && candidate.language.length > 0 && (
              <div className="bg-gray-800/20 border border-gray-700/50 rounded-xl p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-4">Languages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {candidate.language.map((lang, index) => (
                    <div key={index} className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-4">
                      <p className="text-white font-medium">{lang.til}</p>
                      <p className="text-gray-400 text-sm">{lang.daraja}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
