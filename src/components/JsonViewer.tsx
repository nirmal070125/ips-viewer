import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, User, PillIcon, Heart } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useAuth } from "./AuthProvider";
import { Navigate } from "react-router-dom";
import { apiUrl } from "../../public/read-config"

const PatientViewer = () => {
  const { isAuthenticated } = useAuth();
  const [patientId, setPatientId] = useState("");
  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPatientData = async () => {
    if (!patientId) {
      toast({
        title: "Error",
        description: "Please enter a Patient ID",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setPatientData(null);

      const response = await fetch(apiUrl + "/" + patientId + "/summary"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setPatientData(data);

      toast({
        title: "Success",
        description: "Patient summary retrieved",
      });
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch patient data"
      );

      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to fetch patient data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractPatientInfo = (data: any) => {
    if (!data || !data.entry) return null;

    const patientEntry = data.entry.find(
      (entry: any) =>
        entry.resource && entry.resource.resourceType === "Patient"
    );

    if (!patientEntry) return null;
    return patientEntry.resource;
  };

  const extractAllergies = (data: any) => {
    if (!data || !data.entry) return [];

    const composition = data.entry.find(
      (entry: any) =>
        entry.resource && entry.resource.resourceType === "Composition"
    );
    console.log(composition);
    if (!composition || !composition.resource.section) return [];

    const allergySection = composition.resource.section.find(
      (section: any) => section.title === "Allergies"
    );
    console.log(allergySection);
    if (!allergySection || !allergySection.entry) return [];

    const allergyEntries = allergySection.entry
      .map((entry: any) => {
        const reference = entry.reference.split("/")[1];
        console.log(reference);
        return data.entry.find((e: any) => e.fullUrl && e.fullUrl.includes(reference))?.resource;
      })
      .filter(Boolean);

    return allergyEntries;
  };

  const extractMedications = (data: any) => {
    if (!data || !data.entry) return [];

    const composition = data.entry.find(
      (entry: any) =>
        entry.resource && entry.resource.resourceType === "Composition"
    );
    console.log(composition);
    if (!composition || !composition.resource.section) return [];

    const medicationRequest = composition.resource.section.find(
      (section: any) => section.title === "Medications"
    );
    console.log(medicationRequest);
    if (!medicationRequest || !medicationRequest.entry) return [];

    const medicationEntries = medicationRequest.entry
      .map((entry: any) => {
        const reference = entry.reference.split("/")[1];
        console.log(reference);
        return data.entry.find((e: any) => e.fullUrl && e.fullUrl.includes(reference))?.resource;
      })
      .filter(Boolean);

    return medicationEntries;
  };

  const renderPatientInfo = () => {
    const patient = extractPatientInfo(patientData);
    if (!patient) return <p>No patient information available</p>;

    return isAuthenticated ? (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-700 flex items-center">
            <User className="h-5 w-5 mr-2" /> Patient Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-lg font-semibold">
                {patient.name?.[0]?.given?.join(" ")}{" "}
                {patient.name?.[0]?.family}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Gender</p>
              <p className="text-lg capitalize">{patient.gender}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Birth Date</p>
              <p className="text-lg">{patient.birthDate}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-lg">
                {patient.address?.[0]?.line?.join(", ") || "N/A"}
                {patient.address?.[0]?.line ? ", " : ""}
                {patient.address?.[0]?.city || ""}
                {patient.address?.[0]?.city ? ", " : ""}
                {patient.address?.[0]?.postalCode || ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    ) : (
      <Navigate to="/login" replace />
    );
  };

  const renderAllergies = () => {
    const allergies = extractAllergies(patientData);
    if (!allergies || allergies.length === 0)
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-600 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" /> Allergies &
              Intolerances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center">
              <p className="text-lg">No allergy information available</p>
            </div>
          </CardContent>
        </Card>
      );

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-red-600 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" /> Allergies & Intolerances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-red-50">
                <TableHead>Allergy</TableHead>
                <TableHead>Reaction</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allergies.map((allergy: any, index: number) => (
                <TableRow
                  key={index}
                  className={allergy.criticality === "high" ? "bg-red-50" : ""}
                >
                  <TableCell className="font-medium">
                    {allergy.code?.coding?.[0]?.display || "Unknown"}
                  </TableCell>
                  <TableCell>
                    {allergy.reaction?.[0]?.manifestation?.[0]?.coding?.[0]
                      ?.display || "Not specified"}
                  </TableCell>
                  <TableCell>
                    {allergy.criticality === "high" ? (
                      <span className="text-red-600 font-semibold">High</span>
                    ) : (
                      allergy.criticality || "Not specified"
                    )}
                  </TableCell>
                  <TableCell>
                    {allergy.clinicalStatus?.coding?.[0]?.code || "Unknown"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const renderMedications = () => {
    const medications = extractMedications(patientData);
    if (!medications || medications.length === 0)
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-green-600 flex items-center">
              <PillIcon className="h-5 w-5 mr-2" /> Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 text-center">
              <p className="text-lg">No medication information available</p>
            </div>
          </CardContent>
        </Card>
      );

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-green-600 flex items-center">
            <PillIcon className="h-5 w-5 mr-2" /> Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-green-50">
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((med: any, index: number) => {
                const statement = med.statement;
                const medication = med.medication;

                const medicationName =
                  medication?.code?.coding?.[0]?.display ||
                  statement.medicationCodeableConcept?.coding?.[0]?.display ||
                  "Unknown";

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {medicationName}
                    </TableCell>
                    <TableCell>
                      {statement.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity
                        ?.value || "Not specified"}{" "}
                      {statement.dosage?.[0]?.doseAndRate?.[0]?.doseQuantity
                        ?.unit || ""}
                    </TableCell>
                    <TableCell>
                      {statement.dosage?.[0]?.timing?.code?.coding?.[0]
                        ?.display ||
                        statement.dosage?.[0]?.timing?.code?.text ||
                        "Not specified"}
                    </TableCell>
                    <TableCell>{statement.status || "Unknown"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl">
      <Card className="border-2 border-teal-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter Patient ID"
              className="flex-1"
            />
            <Button
              onClick={fetchPatientData}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  Retrieving...
                </>
              ) : (
                "Retrieve Patient Summary"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="p-4 border-red-300 bg-red-50 text-red-800">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </Card>
      )}

      {patientData && (
        <div className="space-y-6">
          {renderPatientInfo()}
          {renderAllergies()}
          {renderMedications()}
        </div>
      )}
    </div>
  );
};

export default PatientViewer;
