import React from "react";
import { Skeleton, Space } from "antd";

const CreateVacancySkeleton: React.FC = () => {
	return (
		<div className='w-full p-6 space-y-6'>
			{/* Sarlavha qismi (Avatar + Sarlavha) */}
			<div className='flex items-start gap-4'>
				<Skeleton.Avatar active size='large' shape='circle' />
				<div className='flex-1'>
					<Skeleton active paragraph={{ rows: 1 }} title={{ width: "60%" }} />
				</div>
			</div>

			{/* Tabs (Ish tavsifi, Korxona haqida) */}
			<Space className='border-b border-gray-100 w-full pb-2' size={24}>
				<Skeleton.Button active size='small' style={{ width: 80 }} />
				<Skeleton.Button active size='small' style={{ width: 100 }} />
			</Space>

			{/* Asosiy matn bloki */}
			<div className='space-y-4'>
				<Skeleton active paragraph={{ rows: 8 }} title={false} />
			</div>

			{/* Pastki ko'nikmalar (Tags) */}
			<div className='flex gap-2'>
				<Skeleton.Button
					active
					size='small'
					shape='round'
					style={{ width: 70 }}
				/>
				<Skeleton.Button
					active
					size='small'
					shape='round'
					style={{ width: 90 }}
				/>
				<Skeleton.Button
					active
					size='small'
					shape='round'
					style={{ width: 60 }}
				/>
			</div>

			{/* Pastki o'ng burchakdagi Telegram tugmasi (Circle) */}
			<div className='fixed bottom-10 right-10'>
				<Skeleton.Button active shape='circle' size='large' />
			</div>
		</div>
	);
};

export default CreateVacancySkeleton;
