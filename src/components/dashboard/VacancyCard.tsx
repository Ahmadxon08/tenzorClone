import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import {
	Edit,
	Trash2,
	Hash,
	ChevronUp,
	ChevronDown,
	Share2,
	Check,
	ExternalLink,
	// Eye,
} from "lucide-react"; // 2. Import Eye
import type { Vacancy } from "../../types/index";
// import ReactMarkdown from "react-markdown";

import { apiService } from "../../services/api";

interface VacancyCardProps {
	vacancy: Vacancy;
	onEdit: (vacancy: Vacancy) => void;
	onDelete: (id: number) => void;
	isLoading: boolean;
	selectedSite: any;
}

import { useAuth } from "../../contexts/AuthContext";
import { isHTML, normalizeText, truncate } from "../../lib/isHTML";

const VacancyCard: React.FC<VacancyCardProps> = ({
	vacancy,
	// onEdit,
	onDelete,
	isLoading,
	selectedSite,
}) => {
	const { t } = useTranslation();
	const { token } = useAuth();
	const navigate = useNavigate();
	const [isExpanded, setIsExpanded] = useState(false);
	const [isCopied, setIsCopied] = useState(false);
	const [recommendationData, setRecommendationData] = useState<any | null>(
		null,
	);
	const [recommendationLoading, setRecommendationLoading] = useState(false);

	const handleToggleDescription = () => {
		setIsExpanded(!isExpanded);
	};
	const handleViewApplications = () => {
		navigate(`/dashboard/applications?id=${encodeURIComponent(vacancy.id)}`);
	};

	const description = normalizeText(vacancy.description);
	const html = isHTML(description);

	const handleCopyLink = async (e: React.MouseEvent) => {
		e.stopPropagation();
		const url = `https://jobx.uz?vacancyId=${vacancy.id}&title=${vacancy.title}&openWidget=true`;
		try {
			await navigator.clipboard.writeText(url);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
		} catch (err) {
			console.error("Failed to copy:", err);
		}
	};
	return (
		<div className='group relative bg-gradient-to-br from-[#0f2a43]/60 to-[#0a1b30]/60 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300'>
			<div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>

			<div className='relative'>
				<div className='flex justify-between items-start mb-4'>
					<div className='flex-1 pr-4'>
						<h3 className='text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors'>
							{vacancy.title}
						</h3>

						<div className='text-white'>
							{/* <ReactMarkdown>
								{isExpanded
									? vacancy.description.replace(/\\n/g, "\n")
									: vacancy.description.slice(0, 100).replace(/\\n/g, "\n") +
										"..."}
							</ReactMarkdown> */}
							<div className='text-gray-300 text-sm leading-relaxed'>
								{isExpanded ? (
									html ? (
										<div dangerouslySetInnerHTML={{ __html: description }} />
									) : (
										description
									)
								) : (
									truncate(
										html
											? description.replace(/<\/?[^>]+(>|$)/g, "") // HTML → text
											: description,
									)
								)}
							</div>
						</div>
					</div>

					<div className='flex flex-col gap-2'>
						<div className='flex gap-1'>
							<button
								onClick={handleCopyLink}
								className='p-2.5 text-cyan-400 cursor-pointer hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 rounded-lg transition-all group/btn'
								title='Share'
							>
								{isCopied ? (
									<Check
										size={18}
										className='group-hover/btn:scale-110 transition-transform'
									/>
								) : (
									<Share2
										size={18}
										className='group-hover/btn:scale-110 transition-transform'
									/>
								)}
							</button>

							<button
								onClick={handleToggleDescription}
								className='p-2.5 text-green-400 cursor-pointer hover:text-green-300 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/40 rounded-lg transition-all disabled:opacity-50 group/btn'
							>
								{isExpanded ? (
									<ChevronUp
										size={18}
										className='group-hover/btn:scale-110 transition-transform'
									/>
								) : (
									<ChevronDown
										size={18}
										className='group-hover/btn:scale-110 transition-transform'
									/>
								)}
							</button>

							{/* <button
								onClick={() => onEdit(vacancy)}
								disabled={isLoading}
								className='p-2.5 text-blue-400 cursor-pointer hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-all disabled:opacity-50 group/btn'
								title={t("vacancyCard.editTitle") || "Edit"}
							>
								<Edit
									size={18}
									className='group-hover/btn:scale-110 transition-transform'
								/>
							</button> */}
							<button
								className='p-2.5 text-blue-400 cursor-pointer hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-all disabled:opacity-50 group/btn'
								onClick={() =>
									navigate("/dashboard/createVacation", { state: { vacancy } })
								}
							>
								<Edit
									size={18}
									className='group-hover/btn:scale-110 transition-transform'
								/>
							</button>

							<button
								onClick={() => onDelete(vacancy.id)}
								disabled={isLoading}
								className='p-2.5 text-red-400 cursor-pointer hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all disabled:opacity-50 group/btn'
								title={t("vacancyCard.deleteTitle") || "Delete"}
							>
								<Trash2
									size={18}
									className='group-hover/btn:scale-110 transition-transform'
								/>
							</button>
						</div>

						<div className='flex items-center gap-3 justify-end'>
							<p className='text-sm font-medium text-gray-700 dark:text-gray-200'>
								Yangi arizalar:
							</p>
							<button
								onClick={handleViewApplications}
								className='p-2.5 text-purple-400 cursor-pointer hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg transition-all group/btn flex items-center gap-2'
								title={
									t("vacancyCard.viewApplicationsNew") || "View Applications"
								}
							>
								{vacancy.new_applications}
							</button>
						</div>
					</div>
				</div>

				{/* Salary and ID */}
				<div className='flex items-center justify-between pt-4 border-t border-white/10'>
					{vacancy.salary ? (
						<div className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg'>
							<span className='text-sm font-bold text-green-300'>
								{vacancy.salary} {vacancy.valyuta || ""}
							</span>
						</div>
					) : (
						<div className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-lg'>
							<span className='text-sm font-medium text-yellow-400'>
								{t("vacancyCard.message") || "Salary not specified"}
							</span>
						</div>
					)}

					<div className='flex items-center gap-1.5 text-gray-500 text-xs'>
						<Hash size={14} />
						<span>{vacancy.id}</span>
					</div>
				</div>

				{/* Recommendation Panel */}
				<div
					style={{ display: "none" }}
					className='mt-4 border-t border-white/10 pt-2'
				>
					<details className='group'>
						<summary
							onClick={async e => {
								const isOpen = (
									e.currentTarget.parentElement as HTMLDetailsElement
								).open;
								if (
									!isOpen &&
									selectedSite?.public_key &&
									selectedSite.site_domain
								) {
									setRecommendationLoading(true);
									setRecommendationData(null);
									try {
										const data = await apiService.getRecommendation(
											vacancy.id,
											selectedSite.public_key,
											selectedSite.site_domain,
											token || "",
										);
										console.log("Recommendation Data:", data);
										setRecommendationData(data);
									} catch (err) {
										console.error("Error fetching recommendation:", err);
										setRecommendationData({ count: 0, candidates: [] });
									} finally {
										setRecommendationLoading(false);
									}
								}
							}}
							className='flex items-center justify-between cursor-pointer list-none text-blue-400 hover:text-blue-300 transition-colors text-sm font-semibold select-none'
						>
							<span>Recommendation / Tavsiyalar</span>
							<span className='transition group-open:rotate-180'>
								<ChevronDown size={16} />
							</span>
						</summary>
						<div className='mt-2 text-xs text-gray-300'>
							{recommendationLoading ? (
								<p className='animate-pulse'>Loading AI recommendations...</p>
							) : recommendationData ? (
								recommendationData.candidates &&
								recommendationData.candidates.length > 0 ? (
									<div className='space-y-2'>
										{recommendationData.candidates.map((candidate: any) => (
											<div
												key={candidate.id}
												className='flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors'
											>
												<span className='text-sm font-medium text-white'>
													{candidate.name || "unknown candidate"}
												</span>
												<div className='flex items-center gap-2 mt-2 sm:mt-0'>
													<span className='text-xs text-gray-400'>
														{candidate.phonenumber}
													</span>
													<button
														onClick={() =>
															navigate(`/candidate/${candidate.id}`)
														}
														className='p-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-lg transition-all group/btn'
														title='View Profile'
													>
														<ExternalLink
															size={14}
															className='group-hover/btn:scale-110 transition-transform'
														/>
													</button>
												</div>
											</div>
										))}
									</div>
								) : (
									<p className='text-yellow-400/80 italic'>
										{t("vacancyCard.noCandidates")}
									</p>
								)
							) : (
								<div />
							)}
						</div>
					</details>
				</div>
			</div>
		</div>
	);
};

export default VacancyCard;
