"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";

export default function CardsPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    setLoading(true);
    setGlobalError(null);
    try {
      const res = await axios.get("/api/cards");
      setCards(res.data.data || []);
    } catch (err) {
      console.error("Xəta baş verdi:", err);
      setGlobalError(err.response?.data?.statusMessage || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCard(cardId) {
    if (!confirm("Bu kartı silmək istədiyinizə əminsiniz?")) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`delete-${cardId}`]: true }));
    try {
      await axios.delete(`/api/cards/${cardId}`);
      setCards((prevCards) =>
        prevCards.filter((card) => card.cardId !== cardId)
      );
    } catch (err) {
      console.error("Kart silinmədi:", err);
      setGlobalError(
        err.response?.data?.statusMessage || "Kart silinə bilmədi"
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${cardId}`]: false }));
    }
  }

  async function deactivateCard(cardId) {
    if (!confirm("Bu kartı deaktiv etmək istədiyinizə əminsiniz?")) {
      return;
    }

    setActionLoading((prev) => ({ ...prev, [`deactivate-${cardId}`]: true }));
    try {
      await axios.patch(`/api/cards/${cardId}/deactivate`, {});
      // Refresh cards to get updated status
      await fetchCards();
    } catch (err) {
      console.error("Kart deaktiv edilmədi:", err);
      setGlobalError(
        err.response?.data?.statusMessage || "Kart deaktiv edilə bilmədi"
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`deactivate-${cardId}`]: false,
      }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Kartlar
            </h1>
            <p className="text-gray-600 mt-2">
              Bütün kartları görüntüləyin və idarə edin
            </p>
          </div>
        </div>

        {/* Global Error */}
        {globalError && (
          <div className="p-4 rounded-xl border-l-4 bg-red-50 border-red-500 text-red-700 shadow-md animate-pulse flex justify-between items-center">
            <span>{globalError}</span>
            <button
              onClick={() => setGlobalError(null)}
              className="text-red-500 hover:text-red-700 font-bold text-lg"
            >
              ×
            </button>
          </div>
        )}

        {/* Cards Grid */}
        {cards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-indigo-100">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Heç bir kart tapılmadı
            </h3>
            <p className="text-gray-500">Sistem əlaqəli kartlar yüklənəcək</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {cards.map((card) => (
              <CardComponent
                key={card.cardId}
                card={card}
                onDelete={deleteCard}
                onDeactivate={deactivateCard}
                actionLoading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CardComponent({ card, onDelete, onDeactivate, actionLoading }) {
  const isActive = card.isActive;
  const isExpired = new Date(card.endDate) < new Date();
  const daysLeft = Math.ceil(
    (new Date(card.endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  const isDeleteLoading = actionLoading[`delete-${card.cardId}`];
  const isDeactivateLoading = actionLoading[`deactivate-${card.cardId}`];

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 relative overflow-hidden">
      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        {isActive && !isExpired ? (
          <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Aktiv
          </div>
        ) : (
          <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {isExpired ? "Vaxtı Keçib" : "Passiv"}
          </div>
        )}
      </div>

      {/* Card Type Badge */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full">
          <span className="text-lg">
            {card.cardType === "MONTHLY"
              ? "📅"
              : card.cardType === "YEARLY"
              ? "🗓️"
              : card.cardType === "DAILY"
              ? "📋"
              : "💳"}
          </span>
          <span className="text-sm font-medium text-indigo-700">
            {card.cardType}
          </span>
        </div>
      </div>

      {/* Card Number */}
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            #{card.cardNumber}
          </h3>
        </div>

        {/* Card Details */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-indigo-500">🗓️</span>
              <span className="text-sm text-gray-600">Başlama</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {new Date(card.startDate).toLocaleDateString("az-AZ")}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-purple-500">📅</span>
              <span className="text-sm text-gray-600">Bitmə</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {new Date(card.endDate).toLocaleDateString("az-AZ")}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-orange-500">🔢</span>
              <span className="text-sm text-gray-600">Limit</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {card.entryLimit}
            </span>
          </div>

          {/* Days Remaining */}
          {!isExpired && daysLeft >= 0 && (
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2">
                <span className="text-indigo-500">⏰</span>
                <span className="text-sm text-indigo-600">Qalan günlər</span>
              </div>
              <span className="text-sm font-bold text-indigo-700">
                {daysLeft} gün
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar for Days */}
        {!isExpired && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  daysLeft > 7
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : daysLeft > 3
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                    : "bg-gradient-to-r from-red-400 to-red-600"
                }`}
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (daysLeft / 30) * 100)
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2">
          {/* Deactivate Button - only show if card is active */}
          {isActive && !isExpired && (
            <button
              onClick={() => onDeactivate(card.cardId)}
              disabled={isDeactivateLoading}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeactivateLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>⏸️</span>
                  Deaktiv et
                </>
              )}
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(card.cardId)}
            disabled={isDeleteLoading}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleteLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <span>🗑️</span>
                Sil
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
