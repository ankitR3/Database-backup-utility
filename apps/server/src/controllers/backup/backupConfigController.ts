import { Request, Response } from 'express';
import prisma from '@repo/db';
import { refreshTask, removeTask } from '../scheduler/backupScheduler';

export async function createBackupConfigController(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const { type, mongoUri, mongoDbName, pgUri, pgDbName } = req.body;

    if (!type) {
        return res.status(400).json({
            message: 'Backup type is required',
        });
    }

    if (type === 'mongo' && (!mongoUri || !mongoDbName)) {
        return res.status(400).json({
            message: 'Mongo config missing'
        });
    }

    if (type === 'postgres' && (!pgUri || !pgDbName)) {
        return res.status(400).json({
            message: 'Postgres config missing',
        });
    }

    const config = await prisma.backupConfig.create({
        data: {
            userId: String(userId),
            type,
            mongoUri,
            mongoDbName,
            pgUri,
            pgDbName,
        },
    });

    res.status(201).json({
        success: true,
        message: 'Backup config saved',
        config,
    });
}

export async function getConfigs(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const configs = await prisma.backupConfig.findMany({
        where: {
            userId: String(userId)
        },
    })

    res.json(configs);
}

export async function toggleScheduler(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const { id, enabled } = req.body;

    if (!id) {
        return res.status(400).json({
            message: 'Config ID required'
        });
    }

    const config = await prisma.backupConfig.findUnique({
        where: { id },
    });

    if (!config || config.userId !== userId) {
        return res.status(403).json({
            message: 'Forbidden'
        });
    }

    const updatedConfig = await prisma.backupConfig.update({
        where: { id },
        data: { enabled },
    });

    if (enabled) {
        refreshTask(updatedConfig);
    } else {
        removeTask(id);
    }

    res.json({
        success: true,
        config: updatedConfig,
    });
}

export async function updateScheduler(req: Request, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({
            message: 'Unauthorized'
        });
    }

    const { id, frequency, time, dayOfWeek } = req.body;

    if (!id) {
        return res.status(400).json({
            message: 'CONFIG ID required'
        })
    }

    const config = await prisma.backupConfig.findUnique({
        where: { id },
    })

    if (!config || config.userId !== userId) {
        return res.status(403).json({
            message: 'Forbidden'
        })
    }

    const updatedConfig = await prisma.backupConfig.update({
        where: {
            id
        },
        data: {
            frequency,
            time,
            dayOfWeek
        },
    });

    removeTask(updatedConfig.id);

    if (updatedConfig.enabled) {
        refreshTask(updatedConfig);
    }

    res.json({
        success: true,
        message: 'Scheduler updated',
        config: updatedConfig,
    });
}

export async function deleteConfig(req: Request, res: Response) {
  const userId = req.user?.id
  const id = req.params.id

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (!id) {
    return res.status(400).json({ message: 'ID required' })
  }

  const config = await prisma.backupConfig.findUnique({
    where: { id },
  })

  if (!config || config.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  removeTask(id)

  await prisma.backupConfig.delete({
    where: { id },
  })

  res.json({ success: true })
}