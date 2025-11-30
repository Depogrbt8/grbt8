'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConfirmed) {
      toast.error('Lütfen şartları kabul edin');
      return;
    }

    try {
      // Simüle edilmiş hesap silme işlemi
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Hesabınız başarıyla silindi');
      onClose();
      // Kullanıcıyı ana sayfaya yönlendir
      window.location.href = '/';
    } catch (error) {
      toast.error('Hesap silme işlemi başarısız oldu');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-[28px] font-bold text-gray-900"
                >
                  Hesabı Sil
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Kaydettiğiniz tüm bilgiler kalıcı olarak silinecektir. Bu, her bilet alımında kişisel bilgilerinizi tekrar girmeniz gerektiği anlamına gelir.
                    </p>
                    <p>
                      Planlanmış veya gerçekleştirilmiş seyahatlerinizle birlikte mevcut rezervasyonlarınıza kolayca ulaşamayacaksınız.
                    </p>
                    <p>
                      gurbetbiz.app'den genel bildirimler almaya devam etseniz de, üyelerimize özel promosyonlar ve kampanyalardan haberdar olma fırsatını kaçıracaksınız.
                    </p>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                        className="rounded text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        Yukarıdaki şartları kabul ediyorum.
                      </span>
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={!isConfirmed}
                      className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isConfirmed
                          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Hesabı Sil
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 