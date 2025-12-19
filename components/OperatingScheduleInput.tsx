"use client";

import { useState, useEffect } from "react";
import {
  OperatingScheduleData,
  WeeklySchedule,
  DailySchedule,
  DAYS_OF_WEEK,
  DAY_LABELS,
  DayOfWeek,
  getDefaultSchedule,
  createEmptyScheduleData,
} from "@/lib/schedule/types";
import {
  calculateScheduleMetrics,
  getScheduleSummary,
} from "@/lib/schedule/scheduleCalculations";
import { InfoTooltip } from "./ui/Tooltip";

interface OperatingScheduleInputProps {
  scheduleData: OperatingScheduleData;
  onChange: (data: OperatingScheduleData) => void;
  businessType: string;
}

export default function OperatingScheduleInput({
  scheduleData,
  onChange,
  businessType,
}: OperatingScheduleInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [useSimpleMode, setUseSimpleMode] = useState(true);

  // Update default schedule when business type changes
  useEffect(() => {
    if (!scheduleData.hasScheduleData && businessType) {
      const defaultSchedule = getDefaultSchedule(businessType);
      const metrics = calculateScheduleMetrics(defaultSchedule);
      onChange({
        ...scheduleData,
        weeklySchedule: defaultSchedule,
        ...metrics,
      });
    }
  }, [businessType]);

  const handleDayChange = (
    day: DayOfWeek,
    field: keyof DailySchedule,
    value: boolean | number
  ) => {
    const newSchedule: WeeklySchedule = {
      ...scheduleData.weeklySchedule,
      [day]: {
        ...scheduleData.weeklySchedule[day],
        [field]: value,
      },
    };

    const metrics = calculateScheduleMetrics(newSchedule);

    onChange({
      ...scheduleData,
      hasScheduleData: true,
      weeklySchedule: newSchedule,
      ...metrics,
    });
  };

  const handleSimpleModeChange = (
    field: "hoursPerDay" | "daysPerWeek",
    value: number
  ) => {
    // Apply simple mode values to all days
    const newSchedule: WeeklySchedule = { ...scheduleData.weeklySchedule };
    const hoursPerDay =
      field === "hoursPerDay" ? value : scheduleData.hoursPerWeek / scheduleData.daysPerWeek || 8;
    const daysPerWeek = field === "daysPerWeek" ? value : scheduleData.daysPerWeek;

    DAYS_OF_WEEK.forEach((day, index) => {
      const isOpen = index < daysPerWeek;
      newSchedule[day] = {
        isOpen,
        startHour: isOpen ? 8 : 0,
        endHour: isOpen ? 8 + hoursPerDay : 0,
      };
    });

    const metrics = calculateScheduleMetrics(newSchedule);

    onChange({
      ...scheduleData,
      hasScheduleData: true,
      weeklySchedule: newSchedule,
      ...metrics,
    });
  };

  const handleOccupancyChange = (value: number) => {
    onChange({
      ...scheduleData,
      hasScheduleData: true,
      averageOccupancyRate: value / 100,
    });
  };

  const handleSeasonalChange = (
    seasonIndex: number,
    field: "occupancyMultiplier" | "hvacIntensityMultiplier",
    value: number
  ) => {
    const newVariations = [...scheduleData.seasonalVariations];
    newVariations[seasonIndex] = {
      ...newVariations[seasonIndex],
      [field]: value,
    };
    onChange({
      ...scheduleData,
      hasScheduleData: true,
      seasonalVariations: newVariations,
    });
  };

  const handleResetToDefault = () => {
    const defaultSchedule = getDefaultSchedule(businessType);
    const metrics = calculateScheduleMetrics(defaultSchedule);
    onChange({
      ...createEmptyScheduleData(businessType),
      weeklySchedule: defaultSchedule,
      hasScheduleData: true,
      ...metrics,
    });
  };

  const hours = Array.from({ length: 25 }, (_, i) => i); // 0-24

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            Operating Schedule
            <span className="ml-2 text-sm font-normal text-gray-500">(Optional)</span>
            <InfoTooltip 
              content="Define your building's operating hours and occupancy patterns. This helps refine energy estimates based on when the building is actively used vs. idle. Useful for buildings with non-standard hours."
              position="right"
            />
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {scheduleData.hasScheduleData
              ? getScheduleSummary(scheduleData)
              : "Define building operating hours for adjusted calculations"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Collapse
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Set Schedule
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Mode toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useSimpleMode}
                onChange={() => setUseSimpleMode(true)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Simple mode</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useSimpleMode}
                onChange={() => setUseSimpleMode(false)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Detailed schedule</span>
            </label>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="ml-auto text-sm text-gray-600 hover:text-gray-700"
            >
              Reset to default
            </button>
          </div>

          {useSimpleMode ? (
            /* Simple mode */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Hours per day
                  <InfoTooltip content="Average number of hours the building is occupied and operating each day." />
                </label>
                <select
                  value={Math.round(scheduleData.hoursPerWeek / Math.max(scheduleData.daysPerWeek, 1))}
                  onChange={(e) =>
                    handleSimpleModeChange("hoursPerDay", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[6, 8, 10, 12, 14, 16, 18, 20, 24].map((h) => (
                    <option key={h} value={h}>
                      {h} hours
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Days per week
                  <InfoTooltip content="Number of days per week the building operates. For most offices this is 5; for retail/restaurants often 6-7." />
                </label>
                <select
                  value={scheduleData.daysPerWeek}
                  onChange={(e) =>
                    handleSimpleModeChange("daysPerWeek", parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[5, 6, 7].map((d) => (
                    <option key={d} value={d}>
                      {d} days
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  Average occupancy
                  <InfoTooltip content="Typical occupancy level during operating hours. 100% = fully occupied, 50% = half capacity on average." />
                </label>
                <select
                  value={Math.round(scheduleData.averageOccupancyRate * 100)}
                  onChange={(e) => handleOccupancyChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[25, 50, 75, 100].map((p) => (
                    <option key={p} value={p}>
                      {p}%
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            /* Detailed schedule */
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-700">Day</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">Open</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">
                      Start Time
                    </th>
                    <th className="text-center py-2 px-2 font-medium text-gray-700">
                      End Time
                    </th>
                    <th className="text-right py-2 px-2 font-medium text-gray-700">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS_OF_WEEK.map((day) => {
                    const daySchedule = scheduleData.weeklySchedule[day];
                    const dayHours =
                      daySchedule.isOpen && daySchedule.endHour > daySchedule.startHour
                        ? daySchedule.endHour - daySchedule.startHour
                        : 0;
                    return (
                      <tr key={day} className="border-b border-gray-100">
                        <td className="py-2 px-2 text-gray-700">{DAY_LABELS[day]}</td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={daySchedule.isOpen}
                            onChange={(e) =>
                              handleDayChange(day, "isOpen", e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={daySchedule.startHour}
                            onChange={(e) =>
                              handleDayChange(day, "startHour", parseInt(e.target.value))
                            }
                            disabled={!daySchedule.isOpen}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            {hours.slice(0, 24).map((h) => (
                              <option key={h} value={h}>
                                {h.toString().padStart(2, "0")}:00
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2">
                          <select
                            value={daySchedule.endHour}
                            onChange={(e) =>
                              handleDayChange(day, "endHour", parseInt(e.target.value))
                            }
                            disabled={!daySchedule.isOpen}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            {hours.map((h) => (
                              <option key={h} value={h}>
                                {h === 24 ? "24:00" : `${h.toString().padStart(2, "0")}:00`}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 px-2 text-right text-gray-700">{dayHours}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Seasonal variations */}
          <div>
            <h4 className="flex items-center text-sm font-medium text-gray-700 mb-3">
              Seasonal HVAC Intensity
              <InfoTooltip content="Adjust HVAC energy usage by season. Higher values for extreme weather (summer/winter), lower for mild seasons (spring/fall)." />
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scheduleData.seasonalVariations.map((sv, index) => (
                <div key={sv.season} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">{sv.season}:</span>
                  <select
                    value={sv.hvacIntensityMultiplier}
                    onChange={(e) =>
                      handleSeasonalChange(
                        index,
                        "hvacIntensityMultiplier",
                        parseFloat(e.target.value)
                      )
                    }
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={0.5}>Low (50%)</option>
                    <option value={0.8}>Moderate (80%)</option>
                    <option value={1.0}>Normal (100%)</option>
                    <option value={1.2}>High (120%)</option>
                    <option value={1.5}>Very High (150%)</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Hours/week:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {scheduleData.hoursPerWeek}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Days/week:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {scheduleData.daysPerWeek}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Annual hours:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {scheduleData.annualOperatingHours.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Occupancy:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {Math.round(scheduleData.averageOccupancyRate * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
