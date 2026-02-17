import { useEffect, useState } from "react";
import BackupButton from "./BackupButton";
import { BackupConfig } from "@/src/types/backup.types";
import axios from "axios";
import { BACKUP_CONFIGS_URL } from "@/routes/api-routes";
import { useSession } from "next-auth/react";

export default function BackupBase() {
    const{ data: session, status } = useSession();
    const [configs, setConfigs] = useState<BackupConfig[]>([]);

    useEffect(() => {
        if (status !== 'authenticated' || !session?.user?.token) {
            return;
        }

        async function fetchConfigs() {
            try {
                const res = await axios.get(BACKUP_CONFIGS_URL, {
                    headers: {
                        Authorization: `Bearer ${session!.user.token}`,
                    },
                });

                setConfigs(res.data);
            } catch (err) {
                console.log('web config fetch error: ', err);
            }
        }

        fetchConfigs();
    }, [status, session]);

    return (
        <div>
            {configs.map((config) => (
                <BackupButton
                    key={config.id}
                    configId={config.id}
                />
            ))}
        </div>
    )
}