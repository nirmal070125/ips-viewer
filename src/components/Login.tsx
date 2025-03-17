import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export default function LoginPage() {
  // const [loggedIn, setLoggedIn] = useState(false);
  return (
    <div
      className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-100 to-green-100"
      style={{ backgroundColor: "#F3F4F6" }}
    >
      <Card className="w-96 shadow-lg bg-white bg-opacity-95 border border-gray-300">
        <CardHeader>
          <CardTitle className="text-center text-blue-700">
            Patient Summary View
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Button
            onClick={() => {
              window.location.href = "/auth/login";
            }}
            className="w-full py-2 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {"Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
