import PatientViewer from "@/components/PatientViewer";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-10">
        <header className="mb-10 text-center">
          <div className="absolute right-20 top-10">
            <Button
              onClick={async () => {
                window.location.href = `/auth/logout?session_hint=${Cookies.get(
                  "session_hint"
                )}`;
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Logout
            </Button>
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-blue-600">
            Patient Summary View
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Quick access to critical patient health information
          </p>
        </header>

        <div className="flex justify-center">
          <PatientViewer />
        </div>
        <footer className="mt-16 text-center text-sm text-slate-500">
          <p className="mb-2">
            Enter a patient ID to retrieve their health summary
          </p>
          <p>
            <span className="text-teal-600">Note:</span> This demo uses a sample
            FHIR patient record
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
