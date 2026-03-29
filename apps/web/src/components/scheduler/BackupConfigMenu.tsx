'use client'
import { IconDotsVertical } from '@tabler/icons-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdownMenu';
import { IconPlus, IconPencil, IconTrash, IconSettings } from '@tabler/icons-react';

type Props = {
    onDelete: () => void
    onEdit?: () => void
    onSettings?: () => void
    onNewBackup?: () => void
}

export default function BackupConfigMenu({ onDelete, onEdit, onSettings, onNewBackup }: Props) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={
                <button className='flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition hover:cursor-pointer'>
                    <IconDotsVertical size={16} className='text-gray-700' />
                </button>
            } />
            <DropdownMenuContent side="bottom" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onNewBackup}>
                        <IconPlus size={14} /> New Backup
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onEdit}>
                        <IconPencil size={14} /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        variant='destructive'
                        onClick={onDelete}
                    >
                        <IconTrash size={14} /> Delete
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSettings}>
                    <IconSettings size={14} /> Settings
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}