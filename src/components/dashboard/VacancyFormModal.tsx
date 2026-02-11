import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../components/ui/select";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import SwitchButton from "../ui/SwitchButton";
import { Plus, X } from "lucide-react";

interface VacancyProps {
	id?: number;
	title: string;
	description: string;
	required_question?: string;
	work_experiance?: string;
	work_schedule?: string;
	position_name?: string;
	salary?: string;
	valyuta?: string;
	position_role?: string;
	required?: string;
	work_time?: string;
	acceptance_rate?: number;
	has_video?: boolean;
	has_widget?: boolean;
	number_of_questions?: number;
	vakansiya_type?: string;
}

interface VacancyFormData {
	title: string;
	description: string;
	required: string;
	required_question?: string;
	work_experiance?: string;
	work_schedule?: string;
	work_time?: string;
	salary?: string;
	valyuta?: string;
	position_name?: string;
	position_role?: string;
	widget_question?: string;
	test_id?: number | null;
	acceptance_rate: number;
	has_video: boolean;
	has_widget: boolean;
	number_of_questions: number | null; // Can be number or null
	vakansiya_type?: "video" | "widget" | "both";
}

interface ApiSite {
	site_id?: string | number | null;
	site_name: string;
	site_domain: string;
	public_key: string;
	domain_id?: string | number | null;
	is_new?: boolean;
}

interface Site {
	site_name: string;
	public_key: string;
	site_domain: string;
	site_id: number;
	domain_id: number;
}

interface VacancyFormModalProps {
	open: boolean;
	vacancy?: VacancyProps;
	onSave: (data: VacancyFormData, selectedSite: Site) => Promise<void>;
	onClose: () => void;
	isLoading: boolean;
	initialSelectedSite?: Site | null;
	siteDomain?: string;
	publicKey?: string;
}

const normalizeSite = (apiSite: ApiSite): Site | null => {
	const siteId =
		typeof apiSite.site_id === "number"
			? apiSite.site_id
			: typeof apiSite.site_id === "string"
				? parseInt(apiSite.site_id, 10)
				: null;

	const domainId =
		typeof apiSite.domain_id === "number"
			? apiSite.domain_id
			: typeof apiSite.domain_id === "string"
				? parseInt(apiSite.domain_id, 10)
				: null;

	if (!siteId || isNaN(siteId)) {
		console.warn("Invalid site_id:", apiSite);
		return null;
	}

	return {
		site_id: siteId,
		site_name: apiSite.site_name,
		site_domain: apiSite.site_domain,
		public_key: apiSite.public_key,
		domain_id: domainId || 0,
	};
};

const VacancyFormModal: React.FC<VacancyFormModalProps> = ({
	open,
	vacancy,
	onSave,
	onClose,
	isLoading,
	initialSelectedSite,
	siteDomain,
	publicKey,
}) => {
	const { t } = useTranslation();
	const { token } = useAuth();
	const [formData, setFormData] = useState<VacancyFormData>({
		title: "",
		salary: "",
		valyuta: "",
		work_experiance: "",
		work_schedule: "",
		work_time: "",
		required: "",
		required_question: "",
		description: "",
		position_name: "",
		position_role: "",
		widget_question: "",
		test_id: 0,
		acceptance_rate: 65,
		has_video: false,
		has_widget: false,
		number_of_questions: null, // Default value set to null
	});

	const [isGenerating, setIsGenerating] = useState(false);
	const [isGeneratingQuestion] = useState(false);
	const [sites, setSites] = useState<Site[]>([]);
	// const [selectedSite, setSelectedSite] = useState<Site | null>(null);
	const [loadingSites, setLoadingSites] = useState(false);
	const [sitesError, setSitesError] = useState<string | null>(null);
	const [selectedSite, setSelectedSite] = useState<Site | null>(
		initialSelectedSite ?? null,
	);
	const [tests, setTests] = useState<
		{ id: number; position_name: string; position_role: string }[]
	>([]);
	const [skills, setSkills] = useState<{ text: string; enabled: boolean }[]>([
		{ text: "", enabled: false },
	]);

	const [blockAddingSkillsForAI, setBlockAddingSkillsForAI] = useState(false);

	const [blockAddingAIQuestions, setBlockAddingAIQuestions] = useState(false);

	const [noTestRequired, setNoTestRequired] = useState(false);
	const [questions, setQuestions] = useState<
		{ text: string; enabled: boolean }[]
	>([{ text: "", enabled: false }]);

	useEffect(() => {
		if (open) {
			setSelectedSite(initialSelectedSite ?? null);
		}
	}, [initialSelectedSite, open]);

	useEffect(() => {
		const fetchTests = async () => {
			try {
				const response = await apiService.getTests(
					token || "",
					publicKey,
					siteDomain,
				);

				if (response && response.data) {
					setTests(response.data);
				}
			} catch (error) {
				console.error("Tests yuklashda xatolik:", error);
			}
		};

		fetchTests();
	}, [publicKey, siteDomain, token]);

	useEffect(() => {
		const fetchSites = async () => {
			if (!token) {
				const errorMsg = t("vacancyForm.noToken") || "No authentication token";
				setSitesError(errorMsg);
				toast.error(errorMsg, {
					position: "top-right",
					autoClose: 3000,
				});
				return;
			}

			setLoadingSites(true);
			setSitesError(null);

			try {
				const response = await apiService.me(token);

				if (
					response.sites &&
					Array.isArray(response.sites) &&
					response.sites.length > 0
				) {
					const normalizedSites = response.sites
						.map((site: ApiSite) => normalizeSite(site))
						.filter((s: Site | null): s is Site => s !== null);

					if (normalizedSites.length > 0) {
						setSites(normalizedSites);
						setSelectedSite(normalizedSites[0]);
					} else {
						const errorMsg =
							t("vacancyForm.noValidSites") || "No valid sites available";
						setSitesError(errorMsg);
						toast.warning(errorMsg, { position: "top-right", autoClose: 4000 });
					}
				} else {
					const errorMsg = t("vacancyForm.noSites") || "No sites available";
					setSitesError(errorMsg);
					toast.warning(errorMsg, { position: "top-right", autoClose: 4000 });
				}
			} catch (err) {
				console.error("Error fetching sites:", err);
				const errorMsg =
					t("vacancyForm.errorFetchingSites") || "Failed to fetch sites";
				setSitesError(errorMsg);
				toast.error(errorMsg, { position: "top-right", autoClose: 4000 });
			} finally {
				setLoadingSites(false);
			}
		};

		if (open) fetchSites();
	}, [open, token, t]);

	useEffect(() => {
		if (vacancy) {
			console.log("vacancys", vacancy);
			const hasVideo =
				vacancy.vakansiya_type === "video" || vacancy.vakansiya_type === "both";
			const hasWidget =
				vacancy.vakansiya_type === "widget" ||
				vacancy.vakansiya_type === "both";
			const skillList =
				(vacancy.required || "")
					.split("\n")
					.map(s => s.trim())
					.filter(s => s !== "")
					.map(s => ({ text: s, enabled: true })) || [];

			const questionList =
				(vacancy.required_question || "")
					.split("\n")
					.map(q => q.trim())
					.filter(q => q !== "")
					.map(q => ({ text: q, enabled: true })) || [];

			setFormData({
				title: vacancy.title || "",
				salary: vacancy.salary || "",
				valyuta: vacancy.valyuta || "",
				work_experiance: vacancy.work_experiance || "",
				work_schedule: vacancy.work_schedule || "",
				work_time: vacancy.work_time || "9:00-18:00",
				required: vacancy.required || "",
				required_question: vacancy.required_question || "",
				description: vacancy.description || "",
				position_name: vacancy.position_name || "",
				position_role: vacancy.position_role || "",
				widget_question: "",
				acceptance_rate: vacancy.acceptance_rate || 65,
				number_of_questions: vacancy.number_of_questions || 0,
				has_video: hasVideo,
				has_widget: hasWidget,
				vakansiya_type:
					(vacancy.vakansiya_type as "video" | "widget" | "both") || "video",
			});

			// If vacancy has skills → load them; else create 1 empty row
			setSkills(skillList.length ? skillList : [{ text: "", enabled: false }]);

			// Same for questions
			setQuestions(
				questionList.length ? questionList : [{ text: "", enabled: false }],
			);
		} else {
			// RESET MODE
			setFormData({
				title: "",
				salary: "",
				valyuta: "",
				work_experiance: "",
				work_schedule: "",
				work_time: "",
				required: "",
				required_question: "",
				description: "",
				position_name: "",
				position_role: "",
				widget_question: "",
				acceptance_rate: 0,
				has_video: false,
				has_widget: false,
				number_of_questions: null,
			});
			setSkills([{ text: "", enabled: false }]);
			setQuestions([{ text: "", enabled: false }]);
		}
	}, [vacancy, open]);
	const validateRequiredFields = (data: VacancyFormData) => {
		if (!data.title?.trim()) return "Title is required";
		if (!data.required?.trim()) return "Required/skills field is required";
		if (!data.has_video && !data.has_widget) {
			return "Please select at least one option: Video or Widget";
		}
		return null;
	};
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedSite) {
			toast.error(t("vacancyForm.selectSiteAlert") || "Please select a site");
			return;
		}

		const validateErr = validateRequiredFields(formData);
		if (validateErr) {
			toast.error(validateErr);
			return;
		}

		// Convert skills/questions → final string
		const finalSkills = skills
			.filter(s => s.enabled && s.text.trim() !== "")
			.map(s => s.text.trim())
			.join("\n");

		const finalQuestions = questions
			.filter(q => q.enabled && q.text.trim() !== "")
			.map(q => q.text.trim())
			.join("\n");

		const finalData: VacancyFormData = {
			...formData,
			required: finalSkills,
			required_question: finalQuestions,
			has_video: formData.has_video,
			has_widget: formData.has_widget,
			number_of_questions: formData.number_of_questions || 6,
			vakansiya_type: (formData.has_video && formData.has_widget
				? "both"
				: formData.has_video
					? "video"
					: "widget") as "video" | "widget" | "both",
		};

		try {
			toast.loading("Saving vacancy...", { toastId: "saveManual" });

			await onSave(finalData, selectedSite);

			toast.update("saveManual", {
				render: "Vacancy created successfully",
				type: "success",
				isLoading: false,
				autoClose: 2500,
			});
			onClose();
		} catch (err: any) {
			console.error(err);
			toast.update("saveManual", {
				render: err?.message || "Failed to create vacancy",
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
		}
	};

	const handleGenerateDescriptionAI = async () => {
		if (!selectedSite) {
			toast.error("Please select a site");
			return;
		}

		const finalQuestions = questions
			.filter(q => q.enabled && q.text.trim() !== "")
			.map(q => q.text.trim())
			.join("\n");

		if (!formData.title?.trim() || finalQuestions.length === 0) {
			toast.warning(
				"Fill both title and required question to generate description",
			);
			return;
		}

		setIsGenerating(true);
		const tid = toast.loading("Generating description...");

		try {
			const payload = {
				tittle: formData.title,
				required_question: finalQuestions,

				work_experiance: formData.work_experiance || "",
				work_schedule: formData.work_schedule || "",
				position_name: formData.position_name || "",
				salary: formData.salary || "",
				valyuta: formData.valyuta || "",
				position_role: formData.position_role || "",

				required: skills
					.filter(s => s.enabled && s.text.trim() !== "")
					.map(s => s.text.trim())
					.join("\n"),
			};

			const res = await apiService.generateVacancyDescription(payload);
			const generatedDescription = res.answer || "";

			setFormData(prev => ({
				...prev,
				description: generatedDescription,
			}));

			toast.update(tid, {
				render: "Description generated successfully",
				type: "success",
				isLoading: false,
				autoClose: 2500,
			});
		} catch (err: any) {
			console.error("Error generating description:", err);
			toast.update(tid, {
				render: err?.message || "Failed to generate description",
				type: "error",
				isLoading: false,
				autoClose: 3000,
			});
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSubmitAI = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedSite) {
			toast.error("Please select a site");
			return;
		}

		if (!token) {
			toast.error("Authentication token missing");
			return;
		}

		if (!formData.description?.trim()) {
			toast.error("Description is empty. Generate it first.");
			return;
		}

		// Convert the new structure → backend string format
		const finalSkills = skills
			.filter(s => s.enabled && s.text.trim() !== "")
			.map(s => s.text.trim())
			.join("\n");

		// Get questions from formData.required_question (text area) and split by newlines
		const finalQuestions = formData.required_question
			? formData.required_question
					.split("\n")
					.filter(q => q.trim() !== "")
					.join("\n")
			: "";

		const finalData = {
			...formData,
			required: finalSkills,
			required_question: finalQuestions,
		};

		try {
			const toastId = toast.loading("Saving AI vacancy...");

			await onSave(finalData, selectedSite);

			toast.update(toastId, {
				render: "AI vacancy saved",
				type: "success",
				isLoading: false,
				autoClose: 2500,
			});

			onClose();
		} catch (err: any) {
			console.error("Error saving AI vacancy:", err);
			toast.error(err?.message || "Failed to save AI vacancy");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-y-auto no-scrollbar bg-gradient-to-br from-[#0a1b30] to-[#071226] border-white/10 text-white'>
				<DialogHeader>
					<DialogTitle className='text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
						{vacancy
							? t("vacancyForm.modalTitleEdit")
							: t("vacancyForm.modalTitleCreate")}
					</DialogTitle>
				</DialogHeader>

				<Tabs className='text-white'>
					<TabList className='flex border-b border-white/10'>
						<Tab
							className='px-4 py-2 hover:text-white hover:cursor-pointer focus:outline-none rounded-sm'
							selectedClassName='text-blue-400 bg-blue-500/10 border-blue-500/20'
						>
							Create Vacancy
						</Tab>
						<Tab
							className='px-4 py-2 hover:text-white hover:cursor-pointer focus:outline-none rounded-sm'
							selectedClassName='text-blue-400 bg-blue-500/10 border-blue-500/20'
						>
							Create Vacancy with AI
						</Tab>
					</TabList>

					<TabPanel>
						<form onSubmit={handleSubmit} className='space-y-5 mt-4'>
							{/* Site Selection */}
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									{t("vacancyForm.selectSite.label")}{" "}
									<span className='text-red-500'>*</span>
								</label>

								{loadingSites ? (
									<div className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-gray-400 flex items-center'>
										<svg
											className='animate-spin h-4 w-4 mr-2'
											viewBox='0 0 24 24'
										>
											<circle
												className='opacity-25'
												cx='12'
												cy='12'
												r='10'
												stroke='currentColor'
												strokeWidth='4'
												fill='none'
											/>
											<path
												className='opacity-75'
												fill='currentColor'
												d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
											/>
										</svg>
										{t("vacancyForm.loadingSites")}
									</div>
								) : sitesError ? (
									<div className='w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400'>
										{sitesError}
									</div>
								) : sites.length === 0 ? (
									<div className='w-full px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400'>
										{t("vacancyForm.noSitesAvailable")}
									</div>
								) : (
									<Select
										value={
											selectedSite
												? `${selectedSite.site_id}_${selectedSite.site_domain}`
												: ""
										}
										onValueChange={value => {
											const site = sites.find(
												s => `${s.site_id}_${s.site_domain}` === value,
											);
											if (site) setSelectedSite(site);
										}}
										disabled={isLoading}
									>
										<SelectTrigger className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50'>
											<SelectValue
												placeholder={t("vacancyForm.selectSite.placeholder")}
											/>
										</SelectTrigger>

										<SelectContent className='bg-[#0a1b30] border-white/10 text-white'>
											{sites.map(site => (
												<SelectItem
													key={`${site.site_id}_${site.site_domain}`}
													value={`${site.site_id}_${site.site_domain}`}
													className='focus:bg-blue-500/20 focus:text-white cursor-pointer'
												>
													{site.site_name} ({site.site_domain})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>

							<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.title.label")}{" "}
										<span className='text-red-500'>*</span>
									</label>
									<input
										type='text'
										required
										value={formData.title}
										onChange={e =>
											setFormData({ ...formData, title: e.target.value })
										}
										className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white placeholder-gray-500'
										placeholder={t("vacancyForm.title.placeholder")}
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.salary.label")}
									</label>
									<input
										type='text'
										value={formData.salary}
										onChange={e => {
											// Only allow numbers and hyphens
											const value = e.target.value.replace(/[^0-9-]/g, "");
											// Ensure only one hyphen is present and it's not at the start or end
											const parts = value.split("-");
											if (parts.length > 2) {
												// If more than one hyphen, keep only the first part and the hyphen
												setFormData({
													...formData,
													salary: `${parts[0]}-${parts[1] || ""}`.replace(
														/-+/g,
														"-",
													),
												});
											} else if (value.endsWith("-") && !value.endsWith("--")) {
												// Allow single hyphen at the end for range input
												setFormData({ ...formData, salary: value });
											} else if (
												value.length === 0 ||
												/^\d+$/.test(value) ||
												/^\d+-\d*$/.test(value)
											) {
												// Allow empty, numbers only, or number followed by hyphen and optional number
												setFormData({ ...formData, salary: value });
											}
										}}
										className='w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
										placeholder={
											t("vacancyForm.salary.placeholder") || "e.g. 1000-2000"
										}
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.salaryValyuta.label")}
									</label>
									<input
										type='text'
										value={formData.valyuta || ""}
										onChange={e =>
											setFormData({ ...formData, valyuta: e.target.value })
										}
										className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
										placeholder={t("vacancyForm.salaryValyuta.placeholder")}
									/>
								</div>
							</div>

							<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
								{/* Work Experience */}
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.workExperience.label")}
									</label>
									<input
										type='text'
										value={formData.work_experiance}
										onChange={e =>
											setFormData({
												...formData,
												work_experiance: e.target.value,
											})
										}
										placeholder={t("vacancyForm.workExperience.placeholder")}
										className='w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
									/>
								</div>

								{/* Work Schedule (Ish jadvali) */}
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.workSchedule.label")}
									</label>
									<input
										type='text'
										value={formData.work_schedule}
										onChange={e =>
											setFormData({
												...formData,
												work_schedule: e.target.value,
											})
										}
										placeholder={t("vacancyForm.workSchedule.placeholder")}
										className='w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
									/>
								</div>

								{/* Work Time (Ish vaqti) */}
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.workTime.label")}
									</label>
									<input
										type='text'
										value={formData.work_time}
										onChange={e =>
											setFormData({ ...formData, work_time: e.target.value })
										}
										placeholder={t("vacancyForm.workTime.placeholder")}
										className='w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
									/>
								</div>

								{/* Number of Questions */}
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.numberOfQuestions.label")}{" "}
										<span className='text-gray-500 text-xs'>
											({t("optional")})
										</span>
									</label>
									<input
										type='number'
										min='1'
										max='30'
										value={formData.number_of_questions ?? ""}
										onChange={e => {
											const value = e.target.value
												? parseInt(e.target.value)
												: null;
											if (value === null || (value >= 1 && value <= 30)) {
												setFormData({
													...formData,
													number_of_questions: value,
												});
											}
										}}
										onBlur={e => {
											// Set default to 6 if empty, or validate the input
											if (
												e.target.value === "" ||
												parseInt(e.target.value) < 1
											) {
												setFormData({
													...formData,
													number_of_questions: 6, // Default value when empty or invalid
												});
											}
										}}
										className='w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
										placeholder={
											t("vacancyForm.numberOfQuestions.placeholder") || "1-30"
										}
									/>
								</div>
							</div>

							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.positionRole.label")}
									</label>

									<Select
										value={formData.position_role}
										onValueChange={value =>
											setFormData({ ...formData, position_role: value })
										}
									>
										<SelectTrigger className='w-full min-h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white flex items-center'>
											<SelectValue placeholder='Junior / Middle / Senior' />
										</SelectTrigger>

										<SelectContent className='bg-[#0a1b30] text-white'>
											<SelectItem value='Intern'>Intern</SelectItem>
											<SelectItem value='Junior'>Junior</SelectItem>
											<SelectItem value='Middle'>Middle</SelectItem>
											<SelectItem value='Senior'>Senior</SelectItem>
											<SelectItem value='Lead'>Lead</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div>
									<div className='flex justify-between px-2 items-center'>
										<label className='block text-sm font-medium text-gray-300 mb-2'>
											{t("vacancyForm.acceptanceRate") ||
												"Qabul qilish darajasi (%)"}
											<span className='text-red-500 ml-1'>*</span>
										</label>
										<span className='text-xs text-gray-500'>1 - 100</span>
									</div>

									<div className='relative'>
										<input
											type='number'
											min='1'
											max='100'
											placeholder='Masalan: 70'
											value={formData.acceptance_rate || ""}
											onChange={e => {
												const val = e.target.value;
												if (
													val === "" ||
													(Number(val) >= 0 && Number(val) <= 100)
												) {
													setFormData({
														...formData,
														acceptance_rate: Number(val),
													});
												}
											}}
											className='w-full h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white outline-none focus:border-blue-500/50 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
										/>
										<div className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none'>
											%
										</div>
									</div>
								</div>
							</div>
							{/* <div>
                <div className="flex justify-between px-2 items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {t("vacancyForm.allowQuestions")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-300 text-sm">
                      {t("vacancyForm.noTestMode") || "Testlarsiz qabul qilish"}
                    </span>
                    <SwitchButton
                      checked={noTestRequired}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setNoTestRequired(isChecked);
                        if (isChecked) {
                          setFormData({ ...formData, test_id: null });
                        }
                      }}
                    />
                  </div>
                </div>

                <Select
                  disabled={noTestRequired} // Disables the select when switch is ON
                  value={
                    formData.test_id ? String(formData.test_id) : undefined
                  }
                  onValueChange={(value) =>
                    setFormData({ ...formData, test_id: Number(value) })
                  }
                >
                  <SelectTrigger
                    className={`w-full min-h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white flex items-center transition-opacity ${noTestRequired
                        ? "opacity-50 cursor-not-allowed"
                        : "opacity-100"
                      }`}
                  >
                    <SelectValue placeholder={t("vacancyForm.enterTest")} />
                  </SelectTrigger>

                  <SelectContent className="bg-[#0a1b30] border-white/10 text-white max-h-[250px] overflow-y-auto">
                    {tests.length > 0 ? (
                      tests.map((test) => (
                        <SelectItem key={test.id} value={String(test.id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {test.position_name}
                            </span>
                            <span className="text-xs text-gray-400">
                              {test.position_role}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-gray-500 text-center">
                        {t("vacancyForm.noTestsFound")}
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div> */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2'>
								{/* Video Checkbox */}
								<label className='flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer'>
									<div className='relative'>
										<input
											type='checkbox'
											id='has_video'
											checked={formData.has_video || false}
											onChange={() =>
												setFormData(prev => ({
													...prev,
													has_video: !prev.has_video,
													vakansiya_type: !prev.has_video
														? prev.has_widget
															? "both"
															: "video"
														: prev.has_widget
															? "widget"
															: "video",
												}))
											}
											className='absolute opacity-0 w-0 h-0 peer'
										/>
										<div className='w-5 h-5 rounded border-2 border-blue-400 bg-transparent flex items-center justify-center transition-all duration-200 peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/50'>
											<svg
												className='w-3.5 h-3.5 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={3}
													d='M5 13l4 4L19 7'
												/>
											</svg>
										</div>
									</div>
									<span className='text-sm font-medium text-gray-200'>
										Video
									</span>
								</label>
								{/* Widget Checkbox */}
								<label className='flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer'>
									<div className='relative'>
										<input
											type='checkbox'
											id='has_widget'
											checked={formData.has_widget || false}
											onChange={() =>
												setFormData(prev => ({
													...prev,
													has_widget: !prev.has_widget,
													vakansiya_type: !prev.has_widget
														? prev.has_video
															? "both"
															: "widget"
														: prev.has_video
															? "video"
															: "widget",
												}))
											}
											className='absolute opacity-0 w-0 h-0 peer'
										/>
										<div className='w-5 h-5 rounded border-2 border-blue-400 bg-transparent flex items-center justify-center transition-all duration-200 peer-checked:bg-blue-500 peer-checked:border-blue-500 peer-focus:ring-2 peer-focus:ring-blue-500/50'>
											<svg
												className='w-3.5 h-3.5 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100'
												fill='none'
												viewBox='0 0 24 24'
												stroke='currentColor'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={3}
													d='M5 13l4 4L19 7'
												/>
											</svg>
										</div>
									</div>
									<span className='text-sm font-medium text-gray-200'>
										Widget
									</span>
								</label>
							</div>
							{/* Required Skills */}
							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									{t("vacancyForm.required.label")}{" "}
									<span className='text-red-500'>*</span>
								</label>
								<textarea
									rows={1}
									required
									value={formData.required || ""}
									onChange={e => {
										// Update the form data with the new skills
										setFormData({
											...formData,
											required: e.target.value,
										});

										// Also update the skills state to keep it in sync
										setSkills(
											e.target.value
												.split("\n")
												.filter(skill => skill.trim() !== "")
												.map(skill => ({ text: skill.trim(), enabled: true })),
										);
									}}
									className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white resize-none'
									placeholder={
										t("vacancyForm.required.placeholder") ||
										"Mahoratlarni yozing (har biri yangi qatordan boshlansin)..."
									}
								/>
							</div>

							{/* Required Questions */}
							<div className='mb-4'>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									{t("vacancyForm.requiredQuestion.label")}
									{/* <span className='text-red-500 ml-1'>*</span> */}
								</label>
								<textarea
									rows={5}
									// required
									value={formData.required_question || ""}
									onChange={e => {
										const questionsText = e.target.value;
										// Update the form data with the new questions
										setFormData(prev => ({
											...prev,
											required_question: questionsText,
										}));

										// Also update the questions state to keep it in sync
										setQuestions(
											questionsText
												.split("\n")
												.filter(Boolean)
												.map(q => ({ text: q, enabled: true })),
										);
									}}
									className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
									placeholder={
										t("vacancyForm.requiredQuestion.placeholder") ||
										"Savollarni yozing (har bir savol yangi qatordan boshlansin)..."
									}
								/>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									{t("vacancyForm.description.label")}
								</label>
								<textarea
									rows={5}
									// required
									value={formData.description || ""}
									onChange={e =>
										setFormData({ ...formData, description: e.target.value })
									}
									className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white resize-none'
									placeholder={
										t("vacancyForm.description.placeholder") ||
										"Tavsifni yozing..."
									}
								/>
							</div>

							{/* Footer */}
							<DialogFooter className='gap-3 sm:gap-2 pt-6'>
								<button
									type='button'
									onClick={onClose}
									disabled={isLoading || isGenerating}
									className='px-5 py-3 text-sm font-medium text-gray-300 bg-[#0a1b30]/50 hover:bg-[#0a1b30]/70 border border-white/10 rounded-xl disabled:opacity-50'
								>
									{t("vacancyForm.cancel")}
								</button>

								<button
									type='submit'
									disabled={isLoading || isGenerating || !selectedSite}
									className='px-5 py-3 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50'
								>
									{isLoading
										? t("vacancyForm.submitSaving")
										: vacancy
											? t("vacancyForm.submitSave")
											: t("vacancyForm.submitCreate")}
								</button>
							</DialogFooter>
						</form>
					</TabPanel>
					<TabPanel>
						<form onSubmit={handleSubmitAI} className='space-y-5 mt-4'>
							{/* 1. Select Site */}
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									{t("vacancyForm.selectSite.label")}{" "}
									<span className='text-red-500'>*</span>
								</label>

								{loadingSites ? (
									<div className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-gray-400'>
										{t("vacancyForm.loadingSites")}
									</div>
								) : sitesError ? (
									<div className='w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400'>
										{sitesError}
									</div>
								) : (
									<Select
										value={selectedSite?.site_id.toString()}
										onValueChange={value => {
											const site = sites.find(
												s => s.site_id.toString() === value,
											);
											if (site) setSelectedSite(site);
										}}
									>
										<SelectTrigger className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'>
											<SelectValue
												placeholder={t("vacancyForm.selectSite.placeholder")}
											/>
										</SelectTrigger>

										<SelectContent className='bg-[#0a1b30] border-white/10 text-white'>
											{sites.map(site => (
												<SelectItem
													key={site.site_id}
													value={site.site_id.toString()}
												>
													{site.site_name} ({site.site_domain})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</div>

							{/* 2. Job Title + Salary */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.title.label")}{" "}
										<span className='text-red-500'>*</span>
									</label>
									<input
										type='text'
										required
										value={formData.title}
										onChange={e =>
											setFormData({ ...formData, title: e.target.value })
										}
										className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
										placeholder={t("vacancyForm.title.placeholder")}
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.salary.label")}
									</label>
									<input
										type='text'
										value={formData.salary}
										onChange={e =>
											setFormData({ ...formData, salary: e.target.value })
										}
										className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
									/>
								</div>
							</div>

							{/* 3. Work Experience + Schedule + Work Time */}
							<div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.workExperience.label")}
									</label>
									<input
										type='text'
										value={formData.work_experiance}
										onChange={e =>
											setFormData({
												...formData,
												work_experiance: e.target.value,
											})
										}
										className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.workSchedule.label")}
									</label>
									<input
										type='text'
										value={formData.work_schedule}
										onChange={e =>
											setFormData({
												...formData,
												work_schedule: e.target.value,
											})
										}
										className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.workTime.label")}
									</label>
									<input
										type='text'
										value={formData.work_time}
										onChange={e =>
											setFormData({ ...formData, work_time: e.target.value })
										}
										className='w-full px-4 py-3 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white'
									/>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									{t("vacancyForm.positionRole.label")}
								</label>

								<Select
									value={formData.position_role || undefined}
									onValueChange={value =>
										setFormData({ ...formData, position_role: value })
									}
								>
									<SelectTrigger className='w-full min-h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white flex items-center'>
										{/* Dynamic placeholder based on what you usually expect */}
										<SelectValue placeholder='Junior / Middle / Senior' />
									</SelectTrigger>

									<SelectContent className='bg-[#0a1b30] border-white/10 text-white'>
										<SelectItem value='Intern'>Intern</SelectItem>
										<SelectItem value='Junior'>Junior</SelectItem>
										<SelectItem value='Middle'>Middle</SelectItem>
										<SelectItem value='Senior'>Senior</SelectItem>
										<SelectItem value='Lead'>Lead</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div>
								<div className='flex justify-between px-2 items-center mb-2'>
									<label className='block text-sm font-medium text-gray-300'>
										{t("vacancyForm.allowQuestions")}{" "}
										<span className='text-red-500'>*</span>
									</label>
									<div className='flex gap-2 items-center'>
										<span className='text-gray-300 text-sm'>
											{t("vacancyForm.noTestMode") || "Testlarsiz qabul qilish"}
										</span>
										<SwitchButton
											checked={noTestRequired}
											onChange={e => {
												const isChecked = e.target.checked;
												setNoTestRequired(isChecked);
												if (isChecked) {
													// Reset test_id to null when switch is ON
													setFormData({ ...formData, test_id: null });
												}
											}}
										/>
									</div>
								</div>

								<Select
									disabled={noTestRequired} // Disables the select when switch is ON
									value={
										formData.test_id ? String(formData.test_id) : undefined
									}
									onValueChange={value =>
										setFormData({ ...formData, test_id: Number(value) })
									}
								>
									<SelectTrigger
										className={`w-full min-h-[48px] px-4 bg-[#0a1b30]/50 border border-white/10 rounded-xl text-white flex items-center transition-opacity ${
											noTestRequired
												? "opacity-50 cursor-not-allowed"
												: "opacity-100"
										}`}
									>
										<SelectValue placeholder={t("vacancyForm.enterTest")} />
									</SelectTrigger>

									<SelectContent className='bg-[#0a1b30] border-white/10 text-white max-h-[250px] overflow-y-auto'>
										{tests.length > 0 ? (
											tests.map(test => (
												<SelectItem key={test.id} value={String(test.id)}>
													<div className='flex flex-col'>
														<span className='font-medium'>
															{test.position_name}
														</span>
														<span className='text-xs text-gray-400'>
															{test.position_role}
														</span>
													</div>
												</SelectItem>
											))
										) : (
											<div className='p-3 text-sm text-gray-500 text-center'>
												{t("vacancyForm.noTestsFound")}
											</div>
										)}
									</SelectContent>
								</Select>
							</div>

							<div>
								<div className='flex justify-between px-2'>
									<label className='block text-sm font-medium text-gray-300 mb-2'>
										{t("vacancyForm.required.label")}{" "}
										<span className='text-red-500'>*</span>
									</label>
									<div className='flex gap-2'>
										<span className='text-gray-300 text-sm'>
											Boshqa qobilyat qo‘shmayman
										</span>
										<SwitchButton
											checked={blockAddingSkillsForAI}
											onChange={e =>
												setBlockAddingSkillsForAI(e.target.checked)
											}
										/>
									</div>
								</div>

								{/* Top input for adding new skill */}
								<div className='flex items-center gap-3 mb-2'>
									<input
										value={skills[skills.length - 1]?.text || ""}
										onChange={e => {
											const updated = [...skills];
											updated[skills.length - 1].text = e.target.value;
											setSkills(updated);
										}}
										className='flex-1 px-4 py-2 rounded-xl border border-white/10 bg-[#0a1b30]/50 text-white'
										placeholder='Skill...'
									/>
									{!blockAddingSkillsForAI ? (
										<button
											type='button'
											onClick={() =>
												setSkills([...skills, { text: "", enabled: false }])
											}
											className='p-2 text-green-500 hover:bg-green-500/10 rounded'
										>
											<Plus size={16} />
										</button>
									) : (
										<div className='w-8'></div>
									)}
								</div>

								{/* Render the rest of the skills below */}
								{skills.slice(0, skills.length - 1).map((skill, index) => (
									<div key={index} className='flex items-center gap-3 mb-2'>
										<input
											value={skill.text}
											onChange={e => {
												const updated = [...skills];
												updated[index].text = e.target.value;
												setSkills(updated);
											}}
											className='flex-1 px-4 py-2 rounded-xl border border-white/10 bg-[#0a1b30]/50 text-white'
											placeholder='Skill...'
										/>
										<button
											type='button'
											onClick={() => {
												const updated = [...skills];
												updated.splice(index, 1);
												setSkills(updated);
											}}
											className='p-2 text-red-500 hover:bg-red-500/10 rounded'
										>
											<X size={16} />
										</button>
									</div>
								))}
							</div>

							<div>
								<div className='flex justify-between px-2 mb-2'>
									<label className='block text-sm font-medium text-gray-300'>
										{t("vacancyForm.requiredQuestion.label")}
									</label>

									<div className='flex gap-2 items-center'>
										<span className='text-gray-300 text-sm'>
											Boshqa savol qo‘shmayman
										</span>
										<SwitchButton
											checked={blockAddingAIQuestions}
											onChange={e =>
												setBlockAddingAIQuestions(e.target.checked)
											}
										/>
									</div>
								</div>

								{/* Top input for adding new question */}
								<div className='flex items-center gap-3 mb-2'>
									<input
										value={questions[questions.length - 1]?.text || ""}
										onChange={e => {
											const updated = [...questions];
											updated[questions.length - 1].text = e.target.value;
											setQuestions(updated);
										}}
										className='flex-1 px-4 py-2 rounded-xl border border-white/10 bg-[#0a1b30]/50 text-white'
										placeholder='AI Question...'
									/>
									{!blockAddingAIQuestions ? (
										<button
											type='button'
											onClick={() =>
												setQuestions([
													...questions,
													{ text: "", enabled: true },
												])
											}
											className='p-2 text-green-500 hover:bg-green-500/10 rounded'
										>
											<Plus size={16} />
										</button>
									) : (
										<div className='w-8'></div>
									)}
								</div>

								{/* Render the rest of the questions below */}
								{questions.slice(0, questions.length - 1).map((q, index) => (
									<div key={index} className='flex items-center gap-3 mb-2'>
										<input
											value={q.text}
											onChange={e => {
												const updated = [...questions];
												updated[index].text = e.target.value;
												setQuestions(updated);
											}}
											className='flex-1 px-4 py-2 rounded-xl border border-white/10 bg-[#0a1b30]/50 text-white'
											placeholder='AI Question...'
										/>
										<button
											type='button'
											onClick={() => {
												const updated = [...questions];
												updated.splice(index, 1);
												setQuestions(updated);
											}}
											className='p-2 text-red-500 hover:bg-red-500/10 rounded'
										>
											<X size={16} />
										</button>
									</div>
								))}
							</div>

							{/* 7. AI Description */}
							<div>
								<label className='block text-sm font-medium text-gray-300 mb-2'>
									{t("vacancyForm.description.label")}{" "}
									<span className='text-red-500'>*</span>
								</label>
								<textarea
									rows={5}
									readOnly
									value={formData.description}
									className='w-full px-4 py-3 bg-[#0a1b30]/40 border border-white/10 rounded-xl text-white resize-none'
									placeholder={t("vacancyForm.description.placeholder")}
								/>
								<button
									type='button'
									onClick={handleGenerateDescriptionAI}
									disabled={isGenerating || !selectedSite}
									className='mt-2 px-4 py-2 text-white bg-purple-600 rounded-lg'
								>
									{isGenerating
										? t("vacancyForm.generatingDescription")
										: t("vacancyForm.generateDescription")}
								</button>
							</div>

							<DialogFooter className='gap-3 sm:gap-2 pt-6'>
								<button
									type='button'
									onClick={onClose}
									className='px-5 py-3 text-gray-300 bg-[#0a1b30]/50 rounded-xl'
								>
									{t("vacancyForm.cancel")}
								</button>

								<button
									type='submit'
									disabled={isLoading || isGenerating || isGeneratingQuestion}
									className='px-5 py-3 text-white bg-blue-600 rounded-xl'
								>
									{isLoading
										? t("vacancyForm.submitSaving")
										: t("vacancyForm.submitSave")}
								</button>
							</DialogFooter>
						</form>
					</TabPanel>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
};

export default VacancyFormModal;
