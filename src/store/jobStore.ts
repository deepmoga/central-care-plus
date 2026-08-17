import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JobState {
    isCheckedIn: boolean;
    checkInTime: string | null; // ISO string
    isCancelEnabled: boolean;
    cancelExpirationTime: string | null; // ISO string
    privateKms: string;
    outingKms: string;
    comment: string;
    notificationIds: string[];
}

interface JobStore {
    jobs: Record<number, JobState>;
    setCheckIn: (jobId: number, checkInTime: string | null, notificationIds?: string[]) => void;
    setCancelEnabled: (jobId: number, enabled: boolean, expirationTime: string | null) => void;
    setJobDetails: (jobId: number, details: Partial<Pick<JobState, 'privateKms' | 'outingKms' | 'comment'>>) => void;
    clearJobState: (jobId: number) => void;
    clearAllJobStates: () => void;
    getJobState: (jobId: number) => JobState;
    isAnyJobActive: (excludeJobId?: number) => boolean;
}

const initialJobState: JobState = {
    isCheckedIn: false,
    checkInTime: null,
    isCancelEnabled: false,
    cancelExpirationTime: null,
    privateKms: '',
    outingKms: '',
    comment: '',
    notificationIds: [],
};

export const useJobStore = create<JobStore>()(
    persist(
        (set, get) => ({
            jobs: {},
            setCheckIn: (jobId, checkInTime, notificationIds = []) =>
                set((state) => ({
                    jobs: {
                        ...state.jobs,
                        [jobId]: {
                            ...(state.jobs[jobId] || initialJobState),
                            isCheckedIn: true,
                            checkInTime,
                            notificationIds,
                        },
                    },
                })),
            setCancelEnabled: (jobId, enabled, expirationTime) =>
                set((state) => ({
                    jobs: {
                        ...state.jobs,
                        [jobId]: {
                            ...(state.jobs[jobId] || initialJobState),
                            isCancelEnabled: enabled,
                            cancelExpirationTime: expirationTime,
                        },
                    },
                })),
            setJobDetails: (jobId, details) =>
                set((state) => ({
                    jobs: {
                        ...state.jobs,
                        [jobId]: {
                            ...(state.jobs[jobId] || initialJobState),
                            ...details,
                        },
                    },
                })),
            clearJobState: (jobId) =>
                set((state) => {
                    const newJobs = { ...state.jobs };
                    delete newJobs[jobId];
                    return { jobs: newJobs };
                }),
            clearAllJobStates: () =>
                set(() => ({
                    jobs: {},
                })),
            getJobState: (jobId) => {
                const state = get();
                return state.jobs[jobId] || initialJobState;
            },
            isAnyJobActive: (excludeJobId) => {
                const state = get();
                return Object.entries(state.jobs).some(([id, job]) => {
                    if (excludeJobId && Number(id) === excludeJobId) return false;
                    return job.isCheckedIn;
                });
            },
        }),
        {
            name: 'job-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
