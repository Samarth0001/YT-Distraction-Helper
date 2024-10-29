import { withErrorBoundary, withSuspense } from '@chrome-extension-boilerplate/shared';

const InfoTab = () => {
  return (
    <div className="p-4 max-w-[1200px]">
      <h1 className="text-3xl font-bold mb-8">Extension Information</h1>
      <p className="mt-2 text-white">
        Youtube Distraction Helper helps foster healthier viewing habits, reducing the time
        spent on distracting or irrelevant content.
      </p>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 md:pr-4 mb-8 md:mb-0">
          <h2 className="mt-4 mb-2 text-lg font-semibold text-white">Features</h2>
          <div className='flex flex-col gap-4'>
            <div className="flex flex-row gap-4">
              <div className="flex-1 p-4 border border-gray-600 rounded-md">
                <h3 className="text-lg font-semibold text-white">AI Goal Keeper</h3>
                <p className="text-sm text-gray-300">
                  A smart blocker that stops you from wasting time on distracting content. Block videos that are not relevant to your goals.
                </p>
              </div>

              <div className="flex-1 p-4 border border-gray-600 rounded-md">
                <h3 className="text-lg font-semibold text-white">AI Focus Filter</h3>
                <p className="text-sm text-gray-300">
                  A smart filter that helps you focus on the important stuff. Hide anything that can be a distraction.
                </p>
              </div>

            </div>
            <div className="flex-1 p-4 border border-gray-600 rounded-md">
              <h3 className="text-lg font-semibold text-white">No Shorts!</h3>
              <p className="text-sm text-gray-300">
                Shorts are attention black holes. You have the option to hide them all.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default withErrorBoundary(withSuspense(InfoTab, <div>Loading...</div>), <div>Error Occurred</div>);
