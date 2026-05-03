import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Appointment,
  cancelAppointment,
  getBookedTimeSlots,
  getDoctorById,
  getPatientAppointments,
  rescheduleAppointment,
} from "../../../api/firebase/appointments";

const filters = ["All", "Upcoming", "Completed", "Cancelled"];

export default function ScheduleScreen() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [doctorAvailability, setDoctorAvailability] = useState<
    Record<string, string[]>
  >({});
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatientAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching patient appointments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      fetchAppointments();
      return () => {
        isActive = false;
      };
    }, [fetchAppointments]),
  );

  const openRescheduleModal = (app: Appointment) => {
    setSelectedAppointment(app);
    setNewDate("");
    setNewTime("");
    setAvailableDays([]);
    setAvailableTimes([]);
    setModalVisible(true);
  };

  const fetchDoctorAvailability = async (doctorId: string) => {
    setSlotsLoading(true);
    try {
      const doctorData = await getDoctorById(doctorId);
      const availability = ((doctorData as any)?.availability || {}) as Record<
        string,
        string[]
      >;
      setDoctorAvailability(availability);

      const dayEntries = await Promise.all(
        Object.keys(availability).map(async (day) => {
          const booked = await getBookedTimeSlots(doctorId, day);
          const openSlots = (availability[day] || []).filter(
            (time) => !booked.includes(time),
          );
          return { day, openSlots };
        }),
      );

      const days = dayEntries
        .filter(({ openSlots }) => openSlots.length > 0)
        .map(({ day }) => day);
      setAvailableDays(days);

      const initialDay =
        selectedAppointment?.date && days.includes(selectedAppointment.date)
          ? selectedAppointment.date
          : days[0] || "";

      setNewDate(initialDay);
      if (initialDay) {
        const booked = await getBookedTimeSlots(doctorId, initialDay);
        const times = (availability[initialDay] || []).filter(
          (time) => !booked.includes(time),
        );
        setAvailableTimes(times);
        setNewTime(times[0] || "");
      } else {
        setAvailableTimes([]);
        setNewTime("");
      }
    } catch (err) {
      console.error("Error fetching doctor availability", err);
      setDoctorAvailability({});
      setAvailableDays([]);
      setAvailableTimes([]);
      setNewDate("");
      setNewTime("");
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible && selectedAppointment) {
      fetchDoctorAvailability(selectedAppointment.doctorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalVisible, selectedAppointment]);

  useEffect(() => {
    if (!selectedAppointment || !newDate) return;

    const fetchTimesForDay = async () => {
      try {
        const booked = await getBookedTimeSlots(
          selectedAppointment.doctorId,
          newDate,
        );
        const times = (doctorAvailability[newDate] || []).filter(
          (time) => !booked.includes(time),
        );
        setAvailableTimes(times);
        if (times.length > 0 && !times.includes(newTime)) {
          setNewTime(times[0]);
        } else if (times.length === 0) {
          setNewTime("");
        }
      } catch (err) {
        console.error("Error fetching times for day", err);
        setAvailableTimes([]);
        setNewTime("");
      }
    };

    fetchTimesForDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newDate, doctorAvailability]);

  const handleConfirmReschedule = async () => {
    if (!selectedAppointment) return;
    setActionLoading(true);
    try {
      // basic client-side validation
      const proposed = new Date(`${newDate} ${newTime}`);
      if (isNaN(proposed.getTime()) || proposed.getTime() <= Date.now()) {
        Alert.alert("Invalid time", "Please choose a valid future date/time");
        setActionLoading(false);
        return;
      }

      await rescheduleAppointment(
        selectedAppointment.id as string,
        newDate,
        newTime,
      );
      setModalVisible(false);
      setSelectedAppointment(null);
      await fetchAppointments();
    } catch (err: any) {
      console.error("Reschedule error", err);
      Alert.alert("Reschedule failed", err?.message || "Unknown error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async (app: Appointment) => {
    Alert.alert(
      "Cancel appointment",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            setActionLoading(true);
            try {
              await cancelAppointment(app.id as string);
              await fetchAppointments();
            } catch (err: any) {
              console.error("Cancel error", err);
              Alert.alert("Cancel failed", err?.message || "Unknown error");
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const filteredAppointments = appointments.filter((app) => {
    if (activeFilter === "All") return true;
    return app.status === activeFilter;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Search Bar */}
        <View style={styles.header}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Find schedule"
              placeholderTextColor="#9CA3AF"
            />
            <MaterialIcons name="search" size={24} color="#4B5563" />
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterList}
            contentContainerStyle={styles.filterContent}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  activeFilter === filter && styles.filterPillActive,
                ]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scheduleList}
        >
          {loading ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              Loading appointments...
            </Text>
          ) : filteredAppointments.length === 0 ? (
            <Text
              style={{ textAlign: "center", marginTop: 20, color: "#6B7280" }}
            >
              No appointments found.
            </Text>
          ) : (
            filteredAppointments.map((app) => {
              let statusColor = "#38BDF8";
              let statusBg = "#E0F2FE";
              if (app.status === "Completed") {
                statusColor = "#10B981";
                statusBg = "#D1FAE5";
              } else if (app.status === "Cancelled") {
                statusColor = "#EF4444";
                statusBg = "#FEE2E2";
              }

              return (
                <ScheduleCard
                  key={app.id}
                  doctorName={app.doctorName || "Unknown Doctor"}
                  specialty="Doctor"
                  hospital="Clinic"
                  date={app.date}
                  time={app.time}
                  status={app.status}
                  statusColor={statusColor}
                  statusBg={statusBg}
                  buttonLabel={
                    app.status === "Upcoming"
                      ? "Reschedule"
                      : "Make new appointment"
                  }
                  hideTime={app.status === "Completed"}
                  onReschedule={() => openRescheduleModal(app)}
                  onCancel={() => handleCancelAppointment(app)}
                />
              );
            })
          )}
        </ScrollView>
        {modalVisible && (
          <Modal visible={modalVisible} transparent animationType="slide">
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.4)",
              }}
            >
              <View
                style={{
                  width: "92%",
                  backgroundColor: "#fff",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}
                >
                  Reschedule Appointment
                </Text>
                <Text style={{ marginBottom: 8, color: "#6B7280" }}>Date</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.modalDateScroll}
                >
                  {availableDays.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dateItem,
                        newDate === day && styles.dateItemActive,
                      ]}
                      onPress={() => setNewDate(day)}
                    >
                      <Text
                        style={[
                          styles.dateDay,
                          newDate === day && styles.dateTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                      <Text
                        style={[
                          styles.dateNum,
                          newDate === day && styles.dateTextActive,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text
                  style={{ marginBottom: 8, marginTop: 8, color: "#6B7280" }}
                >
                  Time
                </Text>
                {slotsLoading ? (
                  <ActivityIndicator style={{ marginVertical: 8 }} />
                ) : availableTimes.length === 0 ? (
                  <Text style={{ color: "#6B7280", marginBottom: 8 }}>
                    No time slots available
                  </Text>
                ) : (
                  <View style={styles.timeGrid}>
                    {availableTimes.map((slot) => (
                      <TouchableOpacity
                        key={slot}
                        style={[
                          styles.timeItem,
                          newTime === slot && styles.timeItemActive,
                        ]}
                        onPress={() => setNewTime(slot)}
                      >
                        <Text
                          style={[
                            styles.timeText,
                            newTime === slot && styles.timeTextActive,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    marginTop: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedAppointment(null);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginRight: 8,
                    }}
                  >
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleConfirmReschedule}
                    disabled={
                      !newTime ||
                      actionLoading ||
                      slotsLoading ||
                      availableTimes.length === 0
                    }
                    style={{
                      backgroundColor:
                        !newTime ||
                        actionLoading ||
                        slotsLoading ||
                        availableTimes.length === 0
                          ? "#9CA3AF"
                          : "#3B5998",
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                    }}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={{ color: "#fff" }}>Confirm</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

function ScheduleCard({
  doctorName,
  specialty,
  hospital,
  date,
  time,
  status,
  statusColor,
  statusBg,
  buttonLabel,
  hideTime,
  onReschedule,
  onCancel,
}: any) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardImagePlaceholder}>
          <MaterialIcons name="image" size={32} color="#555" />
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.doctorName}>{doctorName}</Text>
            <View
              style={[
                styles.statusBadge,
                { borderColor: statusColor, backgroundColor: "#FFF" },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status}
              </Text>
            </View>
          </View>
          <Text style={styles.specialtyText}>{specialty}</Text>
          <View style={styles.hospitalRow}>
            <MaterialIcons name="location-on" size={14} color="#3B82F6" />
            <Text style={styles.hospitalText}>{hospital}</Text>
          </View>
        </View>
      </View>

      {!hideTime && (
        <View style={styles.timeSection}>
          <View style={styles.timeRow}>
            <MaterialIcons name="access-time" size={16} color="#6B7280" />
            <Text style={styles.timeLabel}>{time}</Text>
          </View>
          <View style={styles.timeRow}>
            <MaterialIcons name="event" size={16} color="#6B7280" />
            <Text style={styles.timeLabel}>{date}</Text>
          </View>
          {buttonLabel ? (
            <TouchableOpacity style={styles.actionBtn} onPress={onReschedule}>
              <Text style={styles.actionBtnText}>{buttonLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      {hideTime && buttonLabel && (
        <View style={styles.fullActionBtnRow}>
          <TouchableOpacity style={styles.actionBtnFull} onPress={onReschedule}>
            <Text style={styles.actionBtnText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === "Upcoming" && (
        <View style={{ marginTop: 12 }}>
          <TouchableOpacity
            style={[styles.actionBtnFull, { backgroundColor: "#EF4444" }]}
            onPress={onCancel}
          >
            <Text style={styles.actionBtnText}>Cancel Appointment</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Reschedule modal placed outside to keep ScheduleScreen cleaner
// Add modal rendering inside ScheduleScreen via small component below

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    padding: 20,
    backgroundColor: "#FFF",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  filterList: {
    flexDirection: "row",
  },
  filterContent: {
    paddingRight: 20,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 12,
    backgroundColor: "#FFF",
  },
  filterPillActive: {
    backgroundColor: "#3B5998",
    borderColor: "#3B5998",
  },
  filterText: {
    color: "#6B7280",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFF",
  },
  scheduleList: {
    padding: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  cardImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  specialtyText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
  },
  hospitalRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hospitalText: {
    fontSize: 12,
    color: "#3B82F6",
    marginLeft: 4,
  },
  timeSection: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  actionBtn: {
    backgroundColor: "#3B5998",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: "auto",
  },
  fullActionBtnRow: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
  actionBtnFull: {
    backgroundColor: "#3B5998",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  modalDateScroll: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dateItem: {
    width: 76,
    height: 78,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#FFF",
  },
  dateItemActive: {
    backgroundColor: "#3B5998",
    borderColor: "#3B5998",
  },
  dateDay: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  dateNum: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  dateTextActive: {
    color: "#FFF",
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  timeItem: {
    width: "31%",
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  timeItemActive: {
    borderColor: "#3B5998",
  },
  timeText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  timeTextActive: {
    color: "#3B5998",
  },
});
