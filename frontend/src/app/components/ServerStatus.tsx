import ServerStatusIndicator from "./ServerStatusIndicator";

export default function ServerStatus() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <ServerStatusIndicator />
    </div>
  );
}
