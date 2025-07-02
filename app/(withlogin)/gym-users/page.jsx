"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import Image from "next/image";

export default function GymUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [modals, setModals] = useState({ user: false, card: false });
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    phoneNumber: "",
    dateOfBirth: "",
    profilePhoto: null,
  });

  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardType: "",
    subscriptionPlanId: "",
    serviceAvailabilityIds: [],
    startDate: "",
    isActive: true,
  });

  // Data from backend
  const [services, setServices] = useState([]);
  const [cardTypes, setCardTypes] = useState([]);
  const [selectedService, setSelectedService] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, servicesRes, cardTypesRes] = await Promise.all([
        axios.get("/api/gymusers"),
        axios.get("/api/services"),
        axios.get("/api/cards/types"),
      ]);
      setUsers(usersRes.data.data || []);
      setServices(servicesRes.data.data || []);
      setCardTypes(cardTypesRes.data || []);
    } catch (err) {
      setActionMessage({ type: "error", text: "Məlumatlar yüklənmədi." });
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setUserForm({
      firstName: "",
      lastName: "",
      fatherName: "",
      phoneNumber: "",
      dateOfBirth: "",
      profilePhoto: null,
    });
    setCardForm({
      cardNumber: "",
      cardType: "",
      subscriptionPlanId: "",
      serviceAvailabilityIds: [],
      startDate: "",
      isActive: true,
    });
    setSelectedService("");
  };

  const openModal = (type, user = null) => {
    setCurrentUser(user);
    setModals({ ...modals, [type]: true });
    resetForms();
    if (user && type === "user") {
      setUserForm({
        firstName: user.firstName,
        lastName: user.lastName,
        fatherName: user.fatherName,
        phoneNumber: user.phoneNumber,
        dateOfBirth: user.dateOfBirth?.split("T")[0] || "",
        profilePhoto: null,
      });
    }
    setActionMessage(null);
  };

  const closeModal = (type) => {
    setModals({ ...modals, [type]: false });
    setActionMessage(null);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData();
    Object.entries(userForm).forEach(([key, value]) => {
      if (value) form.append(key, value);
    });

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      if (currentUser) {
        await axios.put(`/api/gymusers/${currentUser.id}`, form, config);
        setActionMessage({ type: "success", text: "Uğurla yeniləndi." });
      } else {
        await axios.post("/api/gymusers", form, config);
        setActionMessage({
          type: "success",
          text: "Yeni istifadəçi yaradıldı.",
        });
      }
      closeModal("user");
      fetchAll();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: err.response?.data?.statusMessage || "Xəta baş verdi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Clear any existing messages
    setActionMessage(null);

    try {
      const dataToSend = {
        cardNumber: parseInt(cardForm.cardNumber),
        startDate: new Date(cardForm.startDate).toISOString(),
        isActive: cardForm.isActive,
        userId: currentUser?.id,
        subscriptionPlanId: cardForm.subscriptionPlanId,
        serviceAvailabilityIds: cardForm.serviceAvailabilityIds,
        cardType: cardForm.cardType,
      };

      await axios.post("/api/cards", dataToSend);

      // Close modal first
      closeModal("card");

      // Set success message
      setActionMessage({
        type: "success",
        text: `🎉 ${currentUser?.firstName} ${currentUser?.lastName} üçün kart uğurla əlavə edildi!`,
      });

      // Refresh data
      await fetchAll();
    } catch (err) {
      // Keep modal open for error display
      setActionMessage({
        type: "error",
        text:
          err.response?.data?.statusMessage ||
          "Kart əlavə olunarkən xəta baş verdi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Silmək istədiyinizə əminsiniz?")) return;
    setLoadingDeleteId(id);
    try {
      await axios.delete(`/api/gymusers/${id}`);
      setActionMessage({ type: "success", text: "Uğurla silindi." });
      fetchAll();
    } catch (err) {
      setActionMessage({
        type: "error",
        text: "Silinmə zamanı xəta baş verdi.",
      });
    } finally {
      setLoadingDeleteId(null);
    }
  };

  const getFilteredData = () => {
    const service = services.find((s) => s.id === selectedService);
    return {
      plans: service?.subscriptionPlans || [],
      availabilities: service?.availabilities || [],
    };
  };

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
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Gym İstifadəçiləri
              </h1>
              <p className="text-gray-600 mt-2">
                Bütün istifadəçiləri idarə edin
              </p>
            </div>
            <button
              onClick={() => openModal("user")}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
            >
              ✨ Yeni İstifadəçi
            </button>
          </div>
        </div>

        {/* Action Message */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl border-l-4 ${
              actionMessage.type === "success"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-red-50 border-red-500 text-red-700"
            } shadow-md animate-pulse`}
          >
            {actionMessage.text}
          </div>
        )}

        {/* Users Grid */}
        {users.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-indigo-100">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Heç bir istifadəçi tapılmadı
            </h3>
            <p className="text-gray-500">
              İlk istifadəçinizi yaratmaq üçün yuxarıdakı düyməni basın
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={() => openModal("user", user)}
                onDelete={() => handleDelete(user.id)}
                onAddCard={() => openModal("card", user)}
                deleting={loadingDeleteId === user.id}
              />
            ))}
          </div>
        )}

        {/* User Modal */}
        {modals.user && (
          <UserModal
            formData={userForm}
            isSubmitting={isSubmitting}
            error={actionMessage?.type === "error" ? actionMessage.text : null}
            isEdit={!!currentUser}
            onChange={(e) => {
              const { name, value, files } = e.target;
              setUserForm((prev) => ({
                ...prev,
                [name]: files ? files[0] : value,
              }));
            }}
            onSubmit={handleUserSubmit}
            onClose={() => closeModal("user")}
          />
        )}

        {/* Card Modal */}
        {modals.card && (
          <CardModal
            services={services}
            cardTypes={cardTypes}
            cardForm={cardForm}
            isSubmitting={isSubmitting}
            error={actionMessage?.type === "error" ? actionMessage.text : null}
            onChange={(e) => {
              const { name, value, type, checked } = e.target;
              setCardForm((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
              }));
            }}
            onSubmit={handleCardSubmit}
            onClose={() => closeModal("card")}
            selectedService={selectedService}
            onServiceSelect={(e) => {
              setSelectedService(e.target.value);
              setCardForm((prev) => ({
                ...prev,
                subscriptionPlanId: "",
                serviceAvailabilityIds: [],
              }));
            }}
            filteredData={getFilteredData()}
            onAvailabilitiesSelect={(e) => {
              const selectedOptions = Array.from(e.target.selectedOptions).map(
                (opt) => opt.value
              );
              setCardForm((prev) => ({
                ...prev,
                serviceAvailabilityIds: selectedOptions,
              }));
            }}
            user={currentUser}
          />
        )}
      </div>
    </div>
  );
}

// Components
function UserCard({ user, onEdit, onDelete, onAddCard, deleting }) {
  console.log(user);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200">
      <div className="space-y-4">
        <div className="w-full h-48 relative rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
          <Image
            src={user.profilePhotoUrl || "/avatar.jpg"}
            alt="Profil"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">
            {user.firstName} {user.lastName}
          </h3>
          <div className="space-y-1">
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="text-indigo-500">👤</span>
              <span className="font-medium">Ata adı:</span> {user.fatherName}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="text-purple-500">📞</span>
              <span className="font-medium">Telefon:</span> {user.phoneNumber}
            </p>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <span className="text-green-500">🎂</span>
              <span className="font-medium">Doğum tarixi:</span>{" "}
              {new Date(user.dateOfBirth).toLocaleDateString("az-AZ")}
            </p>
          </div>
        </div>
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <button
            onClick={onEdit}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
          >
            ✏️ Redaktə
          </button>
          <button
            onClick={onAddCard}
            className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center gap-1"
          >
            ➕ Kart əlavə et
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1 disabled:opacity-50"
          >
            {deleting ? "⏳" : "🗑️"} Sil
          </button>
        </div>
      </div>
    </div>
  );
}

function UserModal({
  formData,
  isSubmitting,
  error,
  isEdit,
  onChange,
  onSubmit,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? "✏️ İstifadəçini Yenilə" : "✨ Yeni İstifadəçi"}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Ad
              </label>
              <input
                name="firstName"
                required
                value={formData.firstName}
                onChange={onChange}
                placeholder="Adınızı daxil edin..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Soyad
              </label>
              <input
                name="lastName"
                required
                value={formData.lastName}
                onChange={onChange}
                placeholder="Soyadınızı daxil edin..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👤 Ata adı
              </label>
              <input
                name="fatherName"
                value={formData.fatherName}
                onChange={onChange}
                placeholder="Ata adınızı daxil edin..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📞 Telefon nömrəsi
              </label>
              <input
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={onChange}
                placeholder="+994 XX XXX XX XX"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🎂 Doğum tarixi
            </label>
            <input
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={onChange}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📷 Profil şəkli (istəyə bağlı)
            </label>
            <input
              type="file"
              accept="image/*"
              name="profilePhoto"
              onChange={onChange}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              İmtina
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-medium"
            >
              {isSubmitting ? "⏳ Yüklənir..." : isEdit ? "Yenilə" : "Yarat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CardModal({
  services,
  cardTypes,
  cardForm,
  isSubmitting,
  error,
  onChange,
  onSubmit,
  onClose,
  selectedService,
  onServiceSelect,
  filteredData,
  onAvailabilitiesSelect,
  user,
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Kart əlavə et: {user?.firstName} {user?.lastName}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl mb-4 border-l-4 bg-red-50 border-red-500 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kart Nömrəsi
            </label>
            <input
              type="number"
              name="cardNumber"
              value={cardForm.cardNumber}
              onChange={onChange}
              required
              placeholder="Kart nömrəsini daxil edin"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kart Tipi
            </label>
            <select
              name="cardType"
              value={cardForm.cardType}
              onChange={onChange}
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Seçin</option>
              {cardTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servis
            </label>
            <select
              name="serviceId"
              value={selectedService}
              onChange={onServiceSelect}
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="">Servis seçin</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Abunə Planı
            </label>
            <select
              name="subscriptionPlanId"
              value={cardForm.subscriptionPlanId}
              onChange={onChange}
              required
              disabled={!selectedService}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">Plan seçin</option>
              {filteredData.plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.entryCount} giriş - {plan.price} AZN
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xidmət və saatlar (bir və ya bir neçə seçə bilərsiniz)
            </label>
            <select
              multiple
              name="serviceAvailabilityIds"
              value={cardForm.serviceAvailabilityIds}
              onChange={onAvailabilitiesSelect}
              disabled={!selectedService}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
              size={5}
            >
              {filteredData.availabilities.map((avail) => (
                <option key={avail.id} value={avail.id}>
                  Gün: {avail.day} Saat: {avail.startTime} - {avail.endTime}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlama tarixi
            </label>
            <input
              type="date"
              name="startDate"
              value={cardForm.startDate}
              onChange={onChange}
              required
              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={cardForm.isActive}
              onChange={onChange}
              id="isActiveCheckbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActiveCheckbox" className="text-sm text-gray-700">
              Aktiv
            </label>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              İmtina
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 font-medium"
            >
              {isSubmitting ? "⏳ Yüklənir..." : "✨ Kart əlavə et"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
