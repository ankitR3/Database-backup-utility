type Props = {
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    onConfirm: () => void
    onCancel: () => void
}

export default function ConfirmModal({
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
}: Props) {
    return (
        <div className='bg-white rounded-lg p-8 shadow-xl flex flex-col items-center gap-4 w-80'>
            <p className='text-gray-900 font-semibold text-lg'>{title}</p>
            {description && (
                <p className='text-gray-500 text-sm text-center'>{description}</p>
            )}
            <div className='flex gap-3 w-full'>
                <button
                    onClick={onCancel}
                    className='flex-1 px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 transition cursor-pointer'
                >
                    {cancelLabel}
                </button>
                <button
                    onClick={onConfirm}
                    className='flex-1 px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition cursor-pointer'
                >
                    {confirmLabel}
                </button>
            </div>
        </div>
    );
}