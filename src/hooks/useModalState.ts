"use client";

import { useState } from 'react';

export function useModalState() {
  // Modal state'leri
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const [showFavorite, setShowFavorite] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [baggageModalOpen, setBaggageModalOpen] = useState(false);
  const [openFlightId, setOpenFlightId] = useState<string | number | null>(null);

  // Modal handler'ları
  const openPriceAlert = () => setShowPriceAlert(true);
  const closePriceAlert = () => setShowPriceAlert(false);
  
  const openFavorite = () => setShowFavorite(true);
  const closeFavorite = () => setShowFavorite(false);
  
  const openMobileFilter = () => setShowMobileFilter(true);
  const closeMobileFilter = () => setShowMobileFilter(false);
  
  const openSort = () => setShowSort(true);
  const closeSort = () => setShowSort(false);
  
  const openEditModal = () => setShowEditModal(true);
  const closeEditModal = () => setShowEditModal(false);
  
  const openBaggageModal = () => setBaggageModalOpen(true);
  const closeBaggageModal = () => setBaggageModalOpen(false);
  
  const openFlight = (flightId: string | number) => setOpenFlightId(flightId);
  const closeFlight = () => setOpenFlightId(null);

  return {
    // Modal state'leri
    showPriceAlert,
    showFavorite,
    showMobileFilter,
    showSort,
    showEditModal,
    baggageModalOpen,
    openFlightId,
    
    // Modal handler'ları
    openPriceAlert,
    closePriceAlert,
    openFavorite,
    closeFavorite,
    openMobileFilter,
    closeMobileFilter,
    openSort,
    closeSort,
    openEditModal,
    closeEditModal,
    openBaggageModal,
    closeBaggageModal,
    openFlight,
    closeFlight,
  };
} 