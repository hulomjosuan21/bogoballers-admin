export default function LeagueNotApproveYet() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
        League Not Approved Yet
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-md">
        Your league is still under review. Please wait for the administrator’s approval before you can access full features.
      </p>
    </div>
  )
}
