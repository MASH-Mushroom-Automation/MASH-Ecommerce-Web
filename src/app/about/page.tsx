"use client";

export default function AboutPage() {
  const teamMembers = [
    { name: "Kevin A. Llanes", role: "Project Manager" },
    { name: "Irheil Mae S. Antang", role: "Software Engineer" },
    { name: "Ma. Catherine H. Bae", role: "Front-end Developer" },
    { name: "Jin Harold A. Failana", role: "Hardware Programmer" },
    { name: "Jhon Keneth Ryan B. Namias", role: "Back-end Developer" },
    { name: "Emannuel L. Pabua", role: "Database Administrator" },
    { name: "Ronan Renz T. Valencia", role: "Full Stack Developer" },
  ];

  const challenges = [
    "Unpredictable climate conditions and high tropical heat",
    "Devastating pest infestations and contamination",
    "Traditional, labor-intensive methods leading to inconsistent harvests",
    "Limited market access and dependence on middlemen",
    "Pricing uncertainties that discourage growth",
  ];

  const solutions = [
    {
      title: "Automated Growing",
      description:
        "An IoT-enabled chamber monitors and controls temperature, humidity, and CO₂ in real-time",
    },
    {
      title: "AI-Powered Insights",
      description:
        "An AI model analyzes data to predict environmental needs, recommend adjustments, and help detect contamination early",
    },
    {
      title: "Direct Market Access",
      description:
        "An integrated e-commerce platform connects growers directly with consumers, ensuring fairer prices and a streamlined supply chain",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1E392A] to-[#2d5a45] text-white py-20 px-4 md:px-8 lg:px-16">
        <div className="absolute inset-0 bg-[url('/placeholder.png')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Cultivating the Future of Philippine Agriculture
          </h1>
          <p className="text-lg md:text-xl max-w-4xl mx-auto leading-relaxed font-light">
            We are a team of student innovators from the University of Caloocan
            City dedicated to bridging the gap between technology and farming.
            Our mission is to empower local mushroom growers, enhance food
            security, and build a sustainable agricultural future for the
            Philippines through the M.A.S.H. project.
          </p>
        </div>
      </section>

      {/* Challenge & Solution Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Challenge */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-red-500">
              <h2 className="text-3xl font-bold text-[#1E392A] mb-6">
                The Challenge Facing Filipino Growers
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                Mushroom production in the Philippines holds immense potential,
                but small-scale farmers face persistent obstacles. They battle
                everything from unpredictable conditions to market access
                issues:
              </p>
              <ul className="space-y-3">
                {challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-500 mt-1 flex-shrink-0">●</span>
                    <span className="text-gray-700">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#6A994E]">
              <h2 className="text-3xl font-bold text-[#1E392A] mb-6">
                Our Solution: The M.A.S.H. System
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                <strong className="text-[#1E392A]">M.A.S.H.</strong> (Mushroom
                Automation with Smart Hydro-environment) is an integrated
                ecosystem designed to solve these challenges. We combine IoT,
                AI, and e-commerce to create a seamless, data-driven cultivation
                process.
              </p>
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <div key={index} className="bg-[#6A994E]/5 rounded-lg p-4">
                    <h3 className="font-bold text-[#1E392A] mb-2">
                      {solution.title}
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {solution.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E392A] mb-4">
              Meet the Innovators
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              M.A.S.H. is the culmination of a thesis project by a passionate
              team of Computer Science students from the University of Caloocan
              City.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-[#F5F5F5] rounded-xl p-6 text-center hover:shadow-xl transition-shadow duration-300 border border-gray-200 hover:border-[#6A994E]"
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-[#6A994E] to-[#1E392A] rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl font-bold">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-[#1E392A] mb-1">{member.name}</h3>
                <p className="text-sm text-[#6A994E] font-medium">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentor Section */}
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E392A] mb-4">
            Our Academic Adviser
          </h2>
          <p className="text-gray-700 mb-6">
            We are grateful for the guidance and expertise of our Thesis Adviser
            in bringing this project to life.
          </p>
          <div className="inline-block bg-white rounded-xl shadow-lg p-8 border-l-4 border-[#6A994E]">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#1E392A] to-[#6A994E] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">JB</span>
            </div>
            <h3 className="text-xl font-bold text-[#1E392A]">
              Prof. Joemen G. Barrios, MIT
            </h3>
            <p className="text-[#6A994E] font-medium">Thesis Adviser</p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-[#1E392A] to-[#2d5a45] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Our Vision for a Greener Tomorrow
          </h2>
          <div className="space-y-4 text-lg leading-relaxed font-light">
            <p>
              We believe that technology can be a powerful force for good. The
              M.A.S.H. project is more than just a requirement for our Bachelor
              of Science in Computer Science degree; it is our contribution to a
              more food-secure and economically inclusive Philippines.
            </p>
            <p>
              By empowering local farmers with smart tools, we aim to help grow
              not just mushrooms, but also opportunities, livelihoods, and a
              more sustainable future for our communities.
            </p>
          </div>
          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-[#6A994E] font-bold text-xl">
              Join us in growing the mushroom movement!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
