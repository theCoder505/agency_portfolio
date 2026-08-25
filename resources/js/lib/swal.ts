import Swal from 'sweetalert2';

const isDarkMode = () => {
    return document.documentElement.classList.contains('dark');
};

const getSwalThemeConfig = () => {
    const dark = isDarkMode();
    return {
        background: dark ? '#0f172a' : '#ffffff',
        color: dark ? '#f8fafc' : '#0f172a',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#64748b',
    };
};

export const showToast = (message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const theme = getSwalThemeConfig();
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title: message,
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        background: theme.background,
        color: theme.color,
    });
};

export const showSuccessAlert = (title: string, text?: string) => {
    const theme = getSwalThemeConfig();
    return Swal.fire({
        icon: 'success',
        title,
        text,
        background: theme.background,
        color: theme.color,
        confirmButtonColor: '#4f46e5',
    });
};

export const showErrorAlert = (title: string, text?: string) => {
    const theme = getSwalThemeConfig();
    return Swal.fire({
        icon: 'error',
        title,
        text,
        background: theme.background,
        color: theme.color,
        confirmButtonColor: '#ef4444',
    });
};

export const showWarningAlert = (title: string, text?: string) => {
    const theme = getSwalThemeConfig();
    return Swal.fire({
        icon: 'warning',
        title,
        text,
        background: theme.background,
        color: theme.color,
        confirmButtonColor: '#f59e0b',
    });
};

export const confirmAction = async ({
    title = 'Are you sure?',
    text = 'This action cannot be undone.',
    confirmButtonText = 'Yes, proceed',
    cancelButtonText = 'Cancel',
    icon = 'warning',
    confirmButtonColor = '#ef4444',
}: {
    title?: string;
    text?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    icon?: 'warning' | 'info' | 'question' | 'error';
    confirmButtonColor?: string;
} = {}): Promise<boolean> => {
    const theme = getSwalThemeConfig();
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor: theme.cancelButtonColor,
        confirmButtonText,
        cancelButtonText,
        background: theme.background,
        color: theme.color,
        reverseButtons: true,
    });

    return result.isConfirmed;
};

export const showConfirmDialog = async (
    title: string = 'Are you sure?',
    text: string = 'This action cannot be undone.',
    confirmButtonText: string = 'Yes, proceed',
    icon: 'warning' | 'info' | 'question' | 'error' = 'warning',
    confirmButtonColor: string = '#ef4444'
): Promise<boolean> => {
    return confirmAction({
        title,
        text,
        confirmButtonText,
        icon,
        confirmButtonColor,
    });
};

