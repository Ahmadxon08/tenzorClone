export interface Language {
	name: string;
	level: string;
}

export interface VacancyFormData {
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
	languages: Language[];
	work_shifts: string[];
	students: boolean;
	coords: { lat: string | null; long: string | null };
	address: string;
	region: string; // ✅ yangi qo'shildi
	district: string;
}
