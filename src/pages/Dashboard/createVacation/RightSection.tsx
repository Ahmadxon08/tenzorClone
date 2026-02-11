import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import type { VacancyFormData } from "./createVacation.type";
import CreateVacancySkeleton from "./CreateVacationSkeleton";
import { GraduationCap } from "lucide-react";
import { WORK_SHIFTS } from "./CreateVacationPage";

interface RightSectionProps {
	formData: VacancyFormData;
	selectedSite: any;
	isLoading?: boolean;
}

export default function RightSection({
	formData,
	selectedSite,
	isLoading,
}: RightSectionProps) {
	const { user }: any = useAuth();
	const { t } = useTranslation();


	const [activeTab, setActiveTab] = useState("1");

	if (isLoading) {
		return (
			<div className='p-4 lg:p-8 rounded-xl w-full lg:w-[50%] sticky top-5 bg-[#0a1b30]/30 border border-white/5 backdrop-blur-sm'>
				<CreateVacancySkeleton />
			</div>
		);
	}

	return (
		<div className='p-4 lg:p-8 rounded-xl w-full lg:w-[50%] sticky top-5 max-h-[90vh] overflow-y-auto no-scrollbar bg-[#0a1b30]/30 border border-white/5 text-white backdrop-blur-sm'>
			<h2 className='text-lg lg:text-xl font-semibold mb-4 lg:mb-6 text-blue-400 border-b border-white/10 pb-2'>
				{t("rightSection.preview")}
			</h2>

			{/* Header: Logo va Kompaniya nomi */}
			<div className='flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6'>
				<div className='w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10'>
					{user?.company_logo ? (
						<img
							src={user.company_logo}
							alt='Logo'
							className='w-full h-full object-cover'
						/>
					) : (
						<span className='text-lg lg:text-2xl font-bold text-blue-400'>
							{user?.company_name?.charAt(0) || "S"}
						</span>
					)}
				</div>
				<div>
					<h3 className='text-base lg:text-xl font-bold'>
						{user?.company_name || t("rightSection.companyName")}
					</h3>
					<p className='text-blue-400 text-xs lg:text-sm hover:underline cursor-pointer'>
						{selectedSite?.site_domain || t("rightSection.otherCompany")}
					</p>
				</div>
				{/* <div className='ml-auto'>
					<span className='bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded'>
						Yangi
					</span>
				</div> */}
			</div>

			{/* Tab Navigatsiyasi */}
			<div className='flex gap-4 lg:gap-6 border-b border-white/10 mb-4 lg:mb-6'>
				<button
					onClick={() => setActiveTab("1")}
					className={`pb-2 text-xs lg:text-sm font-medium transition-all ${activeTab === "1" ? "text-white border-b-2 border-white" : "text-gray-400"}`}
				>
					{t("rightSection.jobDescription")}
				</button>
				<button
					onClick={() => setActiveTab("2")}
					className={`pb-2 text-xs lg:text-sm font-medium transition-all ${activeTab === "2" ? "text-white border-b-2 border-white" : "text-gray-400"}`}
				>
					{t("rightSection.aboutCompany")}
				</button>
			</div>

			{/* Tab kontenti */}
			{activeTab === "1" ? (
				<div className='space-y-4 lg:space-y-6 animate-in fade-in duration-500'>
					{/* Sarlavha */}
					<div>
						<h1 className='text-xl lg:text-2xl font-bold text-white'>
							{formData.position_role + " "}
							{formData.title || t("rightSection.vacancyTitle")}
						</h1>
						{formData.salary && (
							<p className='text-lg lg:text-xl font-semibold text-green-400 mt-1'>
								{t("rightSection.salary")}: {formData.salary} {formData.valyuta}
							</p>
						)}
					</div>

					{/* Detallar grid */}
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-y-3 lg:gap-y-4 text-xs lg:text-sm'>
						{formData.vakansiya_type && (
							<div>
								<p className='text-gray-400'>{t("rightSection.testType")}:</p>
								<p>
									{formData.vakansiya_type === "both"
										? "VIdeo and Widget"
										: formData.vakansiya_type}
								</p>
							</div>
						)}

						{formData.work_schedule && (
							<div>
								<p className='text-gray-400'>
									{t("rightSection.workSchedule")}:
								</p>
								<p>
									{formData.work_schedule} {formData.work_time}
								</p>
							</div>
						)}

						{formData.work_experiance && (
							<div>
								<p className='text-gray-400'>{t("rightSection.experience")}:</p>
								<p>{formData.work_experiance + "-yil" || "0-1 yil"} </p>
							</div>
						)}

		{formData.work_shifts.length > 0 && (
  <div>
    <p className="text-gray-400">{t("rightSection.shift")}:</p>
    <p>
      {formData.work_shifts
        .map(shiftValue => {
          const shift = WORK_SHIFTS.find(s => s.value === shiftValue);
          return shift ? t(shift.labelKey) : shiftValue;
        })
        .join(", ")}
    </p>
  </div>
)}
					</div>

					{/* Ish tavsifi matni */}
					<div
						className='preview-content text-gray-300 text-sm'
						dangerouslySetInnerHTML={{ __html: formData.description }}
					/>

					{/* Preview uchun ham list stillari kerak bo'ladi */}
					<style>{`
    .preview-content ul { list-style-type: disc; padding-left: 20px; margin-bottom: 10px; }
    .preview-content ol { list-style-type: decimal; padding-left: 20px; margin-bottom: 10px; }
`}</style>
					{/* Ko'nikmalar */}
					{formData.required && (
						<div>
							<h4 className='font-semibold mb-2 text-sm lg:text-base'>
								{t("rightSection.skills")}:
							</h4>
							<div className='flex flex-wrap gap-1 lg:gap-2'>
								{formData.required.split(",").map((skill, idx) => (
									<span
										key={idx}
										className='bg-white/5 border border-white/10 px-2 lg:px-3 py-1 rounded-full text-xs'
									>
										{skill.trim()}
									</span>
								))}
							</div>
						</div>
					)}
					{formData.students && (
						<div className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 w-fit transition-all duration-300'>
							<GraduationCap size={18} />
							<span className='text-sm font-medium'>
								{t("rightSection.studentsCanApply")}
							</span>
						</div>
					)}
					{/* Tillar */}
					{formData.languages.length > 0 && (
						<div>
							<h4 className='font-semibold mb-2 text-blue-400 text-sm lg:text-base'>
								{t("rightSection.languages")}:
							</h4>
							<div className='space-y-1'>
								{formData.languages.map((lang, i) => (
									<div
										key={i}
										className='flex justify-between text-xs lg:text-sm border-b w-[50%] border-white/5 pb-1'
									>
										<span className='text-gray-300'>{lang.name}</span>
										<span className='text-blue-300'>{lang.level}</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			) : (
				<div className='animate-in fade-in duration-500'>
					<h4 className='font-semibold mb-3 text-sm lg:text-base'>
						{user?.company_name} {t("rightSection.about")}
					</h4>
					<div className='text-gray-300 text-xs lg:text-sm leading-relaxed whitespace-pre-line'>
						{user?.description || t("rightSection.noCompanyInfo")}
					</div>

					<div className='mt-4 lg:mt-6 p-3 lg:p-4 bg-white/5 rounded-xl border border-white/10'>
						<p className='text-xs lg:text-sm'>
							<span className='text-gray-400'>{t("rightSection.phone")}:</span>{" "}
							{user?.company_phone}
						</p>
						<p className='text-xs lg:text-sm'>
							<span className='text-gray-400'>{t("rightSection.email")}:</span>{" "}
							{user?.email}
						</p>
					</div>
				</div>
			)}

			{/* Telegram Float Button (Sizning rasmingizdagi kabi) */}
			{/* <div className='mt-12 flex justify-end'>
				<div className='bg-blue-500 p-3 rounded-full shadow-lg shadow-blue-500/50 cursor-pointer hover:scale-110 transition-transform'>
					<svg
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='white'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<line x1='22' y1='2' x2='11' y2='13'></line>
						<polygon points='22 2 15 22 11 13 2 9 22 2'></polygon>
					</svg>
				</div>
			</div> */}
		</div>
	);
}
