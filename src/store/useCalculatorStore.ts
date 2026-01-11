import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Constants for calculation limits
export const FREE_CALCULATION_LIMIT = 3;
export const PRO_CALCULATION_LIMIT = 100;

// IndexedDB Storage Adapter for Zustand
const idbStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};

export type CalculationResult = {
    id: string;
    date: string;
    spend: number;
    clicks: number;
    sales: number;
    customers: number;
    repeatRate: number;
    roas: number;
    ltv: number;
    cpa: number;
};

interface CalculatorState {
    spend: number | string;
    clicks: number | string;
    sales: number | string;
    customers: number | string;
    repeatRate: number | string;
    isPro: boolean;
    calculationsUsed: number;
    lastResetMonth: string; // Format: "YYYY-MM"

    history: CalculationResult[];

    setSpend: (val: number | string) => void;
    setClicks: (val: number | string) => void;
    setSales: (val: number | string) => void;
    setCustomers: (val: number | string) => void;
    setRepeatRate: (val: number | string) => void;
    setIsPro: (val: boolean) => void;

    getCalculationLimit: () => number;
    getRemainingCalculations: () => number;
    canCalculate: () => boolean;
    incrementCalculations: () => void;
    checkAndResetMonthly: () => void;

    calculate: () => CalculationResult | null;
    saveToHistory: (result: CalculationResult) => Promise<void>;
    removeFromHistory: (id: string) => Promise<void>;
    clearHistory: () => Promise<void>;
    fetchHistory: () => Promise<void>;
    fetchProStatus: () => Promise<void>;
}

const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const useCalculatorStore = create<CalculatorState>()(
    persist(
        (set, get) => ({
            spend: '',
            clicks: '',
            sales: '',
            customers: '',
            repeatRate: '',
            isPro: false,
            calculationsUsed: 0,
            lastResetMonth: getCurrentMonth(),
            history: [
                { id: '1', date: new Date(Date.now() - 86400000).toISOString(), spend: 1000, clicks: 500, sales: 4000, customers: 40, repeatRate: 1.2, roas: 4.0, ltv: 120, cpa: 25 },
                { id: '2', date: new Date(Date.now() - 172800000).toISOString(), spend: 1000, clicks: 600, sales: 1500, customers: 30, repeatRate: 1.1, roas: 1.5, ltv: 55, cpa: 33.33 },
                { id: '3', date: new Date(Date.now() - 259200000).toISOString(), spend: 500, clicks: 200, sales: 2500, customers: 25, repeatRate: 1.5, roas: 5.0, ltv: 150, cpa: 20 },
                { id: '4', date: new Date(Date.now() - 345600000).toISOString(), spend: 2000, clicks: 1200, sales: 5000, customers: 60, repeatRate: 1.0, roas: 2.5, ltv: 83.33, cpa: 33.33 },
                { id: '5', date: new Date(Date.now() - 432000000).toISOString(), spend: 750, clicks: 300, sales: 2200, customers: 35, repeatRate: 1.3, roas: 2.93, ltv: 81.71, cpa: 21.42 },
            ],

            setIsPro: (val: boolean) => set({ isPro: val }),

            setSpend: (val) => set({ spend: val }),
            setClicks: (val) => set({ clicks: val }),
            setSales: (val) => set({ sales: val }),
            setCustomers: (val) => set({ customers: val }),
            setRepeatRate: (val) => set({ repeatRate: val }),

            getCalculationLimit: () => {
                const { isPro } = get();
                return isPro ? PRO_CALCULATION_LIMIT : FREE_CALCULATION_LIMIT;
            },

            getRemainingCalculations: () => {
                const { calculationsUsed, getCalculationLimit } = get();
                return Math.max(0, getCalculationLimit() - calculationsUsed);
            },

            canCalculate: () => {
                const { calculationsUsed, getCalculationLimit, checkAndResetMonthly } = get();
                checkAndResetMonthly();
                return calculationsUsed < getCalculationLimit();
            },

            incrementCalculations: () => {
                set((state) => ({ calculationsUsed: state.calculationsUsed + 1 }));
            },

            checkAndResetMonthly: () => {
                const currentMonth = getCurrentMonth();
                const { lastResetMonth } = get();
                if (currentMonth !== lastResetMonth) {
                    set({ calculationsUsed: 0, lastResetMonth: currentMonth });
                }
            },

            calculate: () => {
                const { spend, sales, customers, repeatRate, clicks } = get();

                const s = Number(spend);
                const sl = Number(sales);
                const c = Number(customers);
                const r = Number(repeatRate);
                const cl = Number(clicks);

                if (!s || !sl || !c) return null; // basic validation

                const roas = sl / s;
                // LTV = Sales/Customers * RepeatRate (Treating RepeatRate as multiplier e.g. 1.2)
                const ltv = (sl / c) * r;
                const cpa = s / c;

                return {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    spend: s,
                    clicks: cl,
                    sales: sl,
                    customers: c,
                    repeatRate: r,
                    roas,
                    ltv,
                    cpa
                };
            },

            saveToHistory: async (result) => {
                // Update local state immediately for UI responsiveness
                set((state) => ({ history: [result, ...state.history] }));

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { error } = await supabase.from('calculations').insert({
                        id: result.id,
                        user_id: user.id,
                        spend: result.spend,
                        clicks: result.clicks,
                        sales: result.sales,
                        customers: result.customers,
                        repeat_rate: result.repeatRate,
                        roas: result.roas,
                        ltv: result.ltv,
                        cpa: result.cpa,
                        // created_at will auto-populate with NOW()
                    });

                    if (error) {
                        console.error('Error saving to Supabase:', error);
                        toast.error('Failed to sync with cloud: ' + error.message);
                    } else {
                        toast.success('Saved to cloud!');
                    }
                }
            },

            removeFromHistory: async (id) => {
                set((state) => ({ history: state.history.filter((h) => h.id !== id) }));

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { error } = await supabase.from('calculations').delete().eq('id', id);
                    if (error) {
                        console.error('Error deleting from Supabase:', error);
                    }
                }
            },

            clearHistory: async () => {
                set({ history: [] });

                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { error } = await supabase.from('calculations').delete().eq('user_id', user.id);
                    if (error) {
                        console.error('Error clearing history from Supabase:', error);
                    }
                }
            },

            fetchHistory: async () => {
                try {
                    const supabase = createClient();
                    
                    // Wrap the auth call to catch AbortError
                    let user;
                    try {
                        const { data: { user: authUser } } = await supabase.auth.getUser();
                        user = authUser;
                    } catch (authError) {
                        // Silently return if auth was aborted
                        if (authError instanceof Error && authError.name === 'AbortError') {
                            return;
                        }
                        throw authError;
                    }

                    if (user) {
                        const { data, error } = await supabase
                            .from('calculations')
                            .select('*')
                            .order('created_at', { ascending: false });

                        if (error) {
                            console.error('Error fetching history:', error);
                            return;
                        }

                        if (data) {
                            const mappedHistory: CalculationResult[] = data.map((item) => ({
                                id: item.id,
                                date: item.created_at,
                                spend: Number(item.spend),
                                clicks: Number(item.clicks),
                                sales: Number(item.sales),
                                customers: Number(item.customers),
                                repeatRate: Number(item.repeat_rate),
                                roas: Number(item.roas),
                                ltv: Number(item.ltv),
                                cpa: Number(item.cpa),
                            }));
                            set({ history: mappedHistory });
                        }

                        // Also check and sync Pro status
                        const { data: userData } = await supabase
                            .from('users')
                            .select('subscription_status')
                            .eq('id', user.id)
                            .maybeSingle();

                        const isProFromTable = userData?.subscription_status === 'pro';
                        const isProFromMeta = user.user_metadata?.is_pro === true;
                        if (isProFromTable || isProFromMeta) {
                            set({ isPro: true });
                        }
                    }
                } catch (error) {
                    // Handle AbortError gracefully - this happens during rapid navigation
                    if (error instanceof Error && error.name === 'AbortError') {
                        return;
                    }
                    console.error('Error in fetchHistory:', error);
                }
            },

            fetchProStatus: async () => {
                try {
                    const supabase = createClient();
                    
                    // Wrap the auth call to catch AbortError
                    let user;
                    try {
                        const { data: { user: authUser } } = await supabase.auth.getUser();
                        user = authUser;
                    } catch (authError) {
                        // Silently return if auth was aborted
                        if (authError instanceof Error && authError.name === 'AbortError') {
                            return;
                        }
                        throw authError;
                    }

                    if (user) {
                        const { data: userData } = await supabase
                            .from('users')
                            .select('subscription_status')
                            .eq('id', user.id)
                            .maybeSingle();

                        const isProFromTable = userData?.subscription_status === 'pro';
                        const isProFromMeta = user.user_metadata?.is_pro === true;
                        set({ isPro: isProFromTable || isProFromMeta });
                    } else {
                        set({ isPro: false });
                    }
                } catch (error) {
                    if (error instanceof Error && error.name === 'AbortError') {
                        return;
                    }
                    console.error('Error fetching pro status:', error);
                }
            }
        }),
        {
            name: 'fb-roi-storage',
            storage: createJSONStorage(() => idbStorage),
            // Note: fetchHistory should be called from a useEffect in components, not during hydration
            // to avoid SSR/hydration issues with Supabase auth
        }
    )
);
