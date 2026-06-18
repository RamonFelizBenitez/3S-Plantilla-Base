import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  customClass: {
    popup: 'colored-toast'
  },
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

export const showToast = (message) => {
  const isError = typeof message === 'string' && message.toLowerCase().includes('error');
  Toast.fire({
    icon: isError ? 'error' : 'success',
    title: message
  });
};

export const showConfirm = async (message) => {
  const result = await Swal.fire({
    title: '¿Confirmar Acción?',
    text: message,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#ef4444',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar',
    backdrop: `rgba(0,0,123,0.4)`
  });
  return result.isConfirmed;
};
