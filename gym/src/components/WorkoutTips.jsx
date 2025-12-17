import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronLeft, ChevronRight, Heart, Clock, Target, Zap, X, Share2, Bookmark, ThumbsUp } from 'lucide-react';
import '../styles/workout-tips.css';

const WorkoutTips = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [currentTip, setCurrentTip] = useState(0);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const tips = [
    {
      id: 1,
      title: "Perfect Your Form",
      category: "Technique",
      icon: Target,
      image: "https://i.pinimg.com/736x/f6/8b/ea/f68bead1b77d500f4b97d7b8277d3e50.jpg",
      excerpt: "Quality over quantity - proper form prevents injuries and maximizes results.",
      content: "Focus on controlled movements and proper alignment. Start with lighter weights to master the technique before progressing to heavier loads. Your muscles will thank you later!",
      readTime: "3 min read",
      tips: [
        "Start with bodyweight exercises",
        "Use mirrors to check your form",
        "Ask trainers for guidance",
        "Progress gradually"
      ],
      fullArticle: `
        <h2>Perfect Your Form: The Foundation of Effective Training</h2>
        
        <p>When it comes to fitness, quality always trumps quantity. Proper form is the cornerstone of effective training, preventing injuries and ensuring you get the maximum benefit from every movement.</p>
        
        <h3>Why Form Matters</h3>
        
        <p>Using correct form during exercise ensures that you're targeting the intended muscles and minimizing stress on joints and connective tissues. Poor form not only reduces the effectiveness of your workout but also significantly increases your risk of injury.</p>
        
        <p>Many beginners make the mistake of lifting too heavy too soon, sacrificing form for weight. This approach is counterproductive and potentially dangerous.</p>
        
        <h3>How to Develop Proper Form</h3>
        
        <p><strong>Start with bodyweight exercises:</strong> Before adding external resistance, master movements using just your body weight. This builds the neuromuscular connections needed for proper movement patterns.</p>
        
        <p><strong>Use mirrors strategically:</strong> Gym mirrors aren't just for selfies! Use them to check your alignment during exercises. Pay attention to your posture, joint positions, and movement symmetry.</p>
        
        <p><strong>Seek professional guidance:</strong> Even a few sessions with a qualified personal trainer can dramatically improve your form. They can provide personalized feedback and corrections specific to your body mechanics.</p>
        
        <p><strong>Record yourself:</strong> Video your workouts occasionally to review your form from angles you can't see in the mirror. This can reveal issues you might not be aware of during exercise.</p>
        
        <h3>The Progression Principle</h3>
        
        <p>Once you've mastered proper form with lighter weights or bodyweight exercises, you can gradually increase the challenge. This progressive approach builds a solid foundation of strength and proper movement patterns.</p>
        
        <p>Remember that proper form may feel strange at first if you've been using incorrect techniques. Give your body time to adapt to the correct movement patterns, and soon they'll become second nature.</p>
        
        <h3>Common Form Mistakes to Avoid</h3>
        
        <ul>
          <li>Rounding your back during deadlifts or squats</li>
          <li>Letting knees cave inward during leg exercises</li>
          <li>Using momentum instead of controlled muscle contractions</li>
          <li>Hyperextending joints at the end of movements</li>
          <li>Holding your breath during exertion</li>
        </ul>
        
        <h3>Conclusion</h3>
        
        <p>Investing time in perfecting your form pays dividends in better results and fewer injuries. Remember that fitness is a marathon, not a sprint. Building proper movement patterns now will serve you throughout your fitness journey.</p>
      `
    },
    {
      id: 2,
      title: "Hydration is Key",
      category: "Nutrition",
      icon: Heart,
      image: "https://i.pinimg.com/1200x/61/28/51/612851730703526ac510dcbaca260117.jpg",
      excerpt: "Stay hydrated before, during, and after your workout for optimal performance.",
      content: "Proper hydration improves performance, prevents fatigue, and aids recovery. Drink water throughout the day, not just during workouts.",
      readTime: "2 min read",
      tips: [
        "Drink 16-20oz water 2-3 hours before exercise",
        "Sip 6-12oz every 15-20 minutes during workout",
        "Weigh yourself before and after exercise",
        "Choose water over sports drinks for most workouts"
      ],
      fullArticle: `
        <h2>Hydration is Key: The Foundation of Athletic Performance</h2>
        
        <p>Water is the most essential nutrient for human survival, yet it's often overlooked in fitness regimens. Proper hydration is crucial for optimal physical performance, recovery, and overall health.</p>
        
        <h3>How Hydration Affects Performance</h3>
        
        <p>Even mild dehydration (just 2% of body weight) can significantly impair physical performance. When you're dehydrated:</p>
        
        <ul>
          <li>Your heart works harder to pump blood</li>
          <li>Your body struggles to regulate temperature</li>
          <li>Muscle function and coordination decrease</li>
          <li>Cognitive function and focus diminish</li>
          <li>Recovery slows significantly</li>
        </ul>
        
        <h3>Strategic Hydration for Athletes</h3>
        
        <p><strong>Before Exercise:</strong> Drink 16-20 ounces of water 2-3 hours before your workout. This gives your body time to absorb the fluid and eliminate excess.</p>
        
        <p><strong>During Exercise:</strong> Aim to drink 6-12 ounces every 15-20 minutes during activity. For workouts lasting less than 60 minutes, water is typically sufficient. For longer or more intense sessions, consider a sports drink with electrolytes.</p>
        
        <p><strong>After Exercise:</strong> To properly rehydrate, drink 16-24 ounces of fluid for every pound lost during exercise. Weighing yourself before and after workouts can help you determine your specific needs.</p>
        
        <h3>Signs of Dehydration</h3>
        
        <p>Learn to recognize these warning signs:</p>
        
        <ul>
          <li>Thirst (note: by the time you feel thirsty, you're already dehydrated)</li>
          <li>Dark yellow urine</li>
          <li>Fatigue or dizziness</li>
          <li>Dry mouth and lips</li>
          <li>Decreased urination</li>
          <li>Headache</li>
        </ul>
        
        <h3>Hydration Tips for Athletes</h3>
        
        <p><strong>Create a schedule:</strong> Don't rely on thirst alone. Set specific times to drink water throughout the day.</p>
        
        <p><strong>Carry a water bottle:</strong> Having water readily available makes you more likely to drink regularly.</p>
        
        <p><strong>Monitor urine color:</strong> Aim for pale yellow urine, which indicates proper hydration.</p>
        
        <p><strong>Adjust for conditions:</strong> Increase fluid intake in hot weather, at high altitudes, or during intense training.</p>
        
        <h3>Conclusion</h3>
        
        <p>Proper hydration is one of the simplest yet most effective ways to improve your athletic performance and recovery. Make it a priority in your fitness routine, and your body will thank you with better results and fewer setbacks.</p>
      `
    },
    {
      id: 3,
      title: "Recovery Matters",
      category: "Recovery",
      icon: Clock,
      image: "https://i.pinimg.com/736x/1f/51/85/1f5185ed85f4626c708280f6a029d710.jpg",
      excerpt: "Rest days are just as important as workout days for muscle growth and repair.",
      content: "Your muscles grow during rest, not during workouts. Ensure adequate sleep, proper nutrition, and scheduled rest days for optimal results.",
      readTime: "4 min read",
      tips: [
        "Get 7-9 hours of quality sleep",
        "Include active recovery days",
        "Listen to your body's signals",
        "Incorporate stretching and mobility work"
      ],
      fullArticle: `
        <h2>Recovery Matters: Why Rest Is Essential for Progress</h2>
        
        <p>In the fitness world, there's often an emphasis on pushing harder, training longer, and grinding through discomfort. However, what many people don't realize is that progress happens during recovery, not during the workout itself.</p>
        
        <h3>The Science of Recovery</h3>
        
        <p>When you exercise, especially with resistance training, you create microscopic tears in your muscle fibers. During rest periods, your body repairs these tears, building the muscles back stronger than before. Without adequate recovery time, this process is interrupted, leading to diminished results and increased risk of injury.</p>
        
        <h3>Sleep: The Ultimate Recovery Tool</h3>
        
        <p>Quality sleep is perhaps the most powerful recovery tool available, yet many athletes undervalue it. During deep sleep:</p>
        
        <ul>
          <li>Growth hormone is released, facilitating muscle repair and growth</li>
          <li>The immune system works to reduce inflammation</li>
          <li>The brain consolidates motor learning from your training</li>
          <li>Energy stores are replenished</li>
        </ul>
        
        <p>Aim for 7-9 hours of quality sleep each night. Create a sleep-friendly environment by keeping your bedroom dark, cool, and free from electronic distractions.</p>
        
        <h3>Active vs. Passive Recovery</h3>
        
        <p><strong>Passive recovery</strong> involves complete rest from physical activity. This is important after particularly intense training blocks or when dealing with injuries.</p>
        
        <p><strong>Active recovery</strong> involves low-intensity movement that promotes blood flow without creating additional stress. Examples include:</p>
        
        <ul>
          <li>Light walking or swimming</li>
          <li>Gentle yoga or stretching</li>
          <li>Foam rolling and self-myofascial release</li>
          <li>Low-intensity cycling</li>
        </ul>
        
        <h3>Nutrition for Recovery</h3>
        
        <p>Your body needs proper nutrients to repair and rebuild. Focus on:</p>
        
        <ul>
          <li>Protein for muscle repair (aim for 1.6-2.2g per kg of bodyweight for active individuals)</li>
          <li>Carbohydrates to replenish glycogen stores</li>
          <li>Anti-inflammatory foods like fatty fish, berries, and leafy greens</li>
          <li>Adequate hydration to support all cellular processes</li>
        </ul>
        
        <h3>Listen to Your Body</h3>
        
        <p>Learn to recognize the difference between productive discomfort and warning signs. Persistent fatigue, decreased performance, irritability, and nagging pains are all signals that you need more recovery.</p>
        
        <h3>Conclusion</h3>
        
        <p>Recovery isn't just the absence of training—it's an active process that deserves as much attention as your workouts. By prioritizing rest, sleep, nutrition, and recovery techniques, you'll not only prevent burnout and injury but also maximize your fitness gains.</p>
      `
    },
    {
      id: 4,
      title: "Progressive Overload",
      category: "Training",
      icon: Zap,
      image: "https://i.pinimg.com/1200x/fa/6f/e0/fa6fe04fa7075b08be1f6030fe76042d.jpg",
      excerpt: "Gradually increase intensity to continue making progress and avoid plateaus.",
      content: "Consistently challenge your muscles by increasing weight, reps, or intensity. This principle is fundamental to continuous improvement.",
      readTime: "5 min read",
      tips: [
        "Increase weight by 2.5-5% when you can complete all sets",
        "Add extra reps or sets",
        "Decrease rest time between sets",
        "Try more challenging exercise variations"
      ],
      fullArticle: `
        <h2>Progressive Overload: The Key to Continuous Improvement</h2>
        
        <p>If you've been exercising consistently but aren't seeing results, you might be missing one of the most fundamental principles in fitness: progressive overload. This concept is the backbone of effective training programs and is essential for continued progress.</p>
        
        <h3>What Is Progressive Overload?</h3>
        
        <p>Progressive overload is the gradual increase of stress placed on the body during exercise. Your body adapts to the demands you place on it—to continue improving, you must continually increase those demands in a strategic way.</p>
        
        <p>This principle applies to all fitness goals, whether you're training for strength, endurance, hypertrophy, or general fitness.</p>
        
        <h3>Methods of Progressive Overload</h3>
        
        <p>There are multiple ways to implement progressive overload in your training:</p>
        
        <p><strong>1. Increase the weight:</strong> The most straightforward approach is to add weight to your lifts. A general guideline is to increase by 2.5-5% when you can complete all prescribed sets and reps with good form.</p>
        
        <p><strong>2. Increase volume:</strong> Add more sets or reps to your existing exercises. For example, if you currently do 3 sets of 10 squats, try progressing to 3 sets of 12 or 4 sets of 10.</p>
        
        <p><strong>3. Improve technique:</strong> Performing exercises with better form increases the effectiveness of the movement and often engages more muscle fibers.</p>
        
        <p><strong>4. Decrease rest periods:</strong> Shortening the rest between sets increases the intensity and metabolic demand of your workout.</p>
        
        <p><strong>5. Increase training frequency:</strong> Training a muscle group more often (while ensuring adequate recovery) can increase your weekly volume.</p>
        
        <p><strong>6. Increase time under tension:</strong> Slowing down the eccentric (lowering) phase of movements can increase muscle growth stimulus.</p>
        
        <p><strong>7. Use more challenging variations:</strong> Progress from basic exercises to more difficult variations. For example, move from a standard push-up to a decline push-up.</p>
        
        <h3>Implementing Progressive Overload Safely</h3>
        
        <p>While progressive overload is essential, it must be implemented carefully:</p>
        
        <ul>
          <li>Progress gradually—small, consistent increases are better than large jumps</li>
          <li>Maintain proper form—never sacrifice technique for increased load</li>
          <li>Allow for recovery—progressive overload works only when balanced with adequate rest</li>
          <li>Track your workouts—recording your progress helps you implement overload systematically</li>
          <li>Cycle your intensity—include both higher and lower intensity periods in your long-term plan</li>
        </ul>
        
        <h3>Breaking Through Plateaus</h3>
        
        <p>When progress stalls, consider these strategies:</p>
        
        <ul>
          <li>Change the overload variable—if you've been focusing on weight, try increasing reps instead</li>
          <li>Incorporate periodization—systematically vary your training focus over time</li>
          <li>Reassess recovery—plateaus often indicate insufficient recovery rather than insufficient training</li>
          <li>Evaluate nutrition—ensure you're fueling properly for your training demands</li>
        </ul>
        
        <h3>Conclusion</h3>
        
        <p>Progressive overload is not optional—it's a fundamental requirement for continued improvement in any fitness pursuit. By systematically increasing the demands on your body while allowing for proper recovery, you'll continue making progress long after others have plateaued.</p>
      `
    },
    {
      id: 5,
      title: "Nutrition Timing",
      category: "Nutrition",
      icon: Heart,
      image: "https://i.pinimg.com/736x/bf/46/89/bf46890a3a9c8c9ce820193704934040.jpg",
      excerpt: "When you eat can be as important as what you eat for optimal performance.",
      content: "Fuel your body properly before and after workouts to maximize performance and recovery. Timing your nutrition can make a significant difference.",
      readTime: "3 min read",
      tips: [
        "Eat a balanced meal 2-3 hours before workout",
        "Have a light snack 30-60 minutes before exercise",
        "Consume protein within 30 minutes post-workout",
        "Include carbs and protein in post-workout meals"
      ],
      fullArticle: `
        <h2>Nutrition Timing: Strategic Eating for Optimal Performance</h2>
        
        <p>While what you eat is undoubtedly important, when you eat can significantly impact your athletic performance, recovery, and overall results. Nutrition timing involves strategically planning your meals and snacks around your workouts to optimize energy levels, performance, and recovery.</p>
        
        <h3>Pre-Workout Nutrition</h3>
        
        <p>Proper pre-workout nutrition provides the energy needed for optimal performance and helps prevent muscle breakdown during exercise.</p>
        
        <p><strong>2-3 hours before exercise:</strong> Consume a balanced meal containing:</p>
        <ul>
          <li>Complex carbohydrates (whole grains, starchy vegetables)</li>
          <li>Moderate protein (chicken, fish, tofu)</li>
          <li>Small amount of healthy fats</li>
          <li>Example: Brown rice with grilled chicken and roasted vegetables</li>
        </ul>
        
        <p><strong>30-60 minutes before exercise:</strong> If needed, have a small, easily digestible snack:</p>
        <ul>
          <li>Simple carbohydrates for quick energy</li>
          <li>Small amount of protein</li>
          <li>Low in fat and fiber (which can cause digestive discomfort)</li>
          <li>Example: Banana with a tablespoon of nut butter or a small smoothie</li>
        </ul>
        
        <h3>Intra-Workout Nutrition</h3>
        
        <p>For most workouts under 60 minutes, water is sufficient. For longer or very intense sessions:</p>
        <ul>
          <li>Sports drinks can provide carbohydrates and electrolytes</li>
          <li>Branched-chain amino acids (BCAAs) may help reduce muscle breakdown</li>
          <li>Easily digestible carbohydrate sources like energy gels can maintain energy levels</li>
        </ul>
        
        <h3>Post-Workout Nutrition</h3>
        
        <p>The post-workout "anabolic window" is a critical time for recovery and adaptation:</p>
        
        <p><strong>Within 30 minutes after exercise:</strong></p>
        <ul>
          <li>Consume 20-40g of high-quality protein to stimulate muscle protein synthesis</li>
          <li>Include carbohydrates to replenish glycogen stores (ratio of 3:1 or 4:1 carbs to protein)</li>
          <li>Example: Protein shake with fruit or chocolate milk</li>
        </ul>
        
        <p><strong>1-2 hours after exercise:</strong></p>
        <ul>
          <li>Eat a complete meal with protein, carbohydrates, and vegetables</li>
          <li>Include anti-inflammatory foods to aid recovery</li>
          <li>Example: Salmon with sweet potatoes and leafy greens</li>
        </ul>
        
        <h3>Nutrition Timing for Different Goals</h3>
        
        <p><strong>For muscle building:</strong> Ensure consistent protein intake throughout the day (every 3-4 hours) and slightly higher carbohydrate intake around workouts.</p>
        
        <p><strong>For fat loss:</strong> Consider fasted training or reducing carbohydrates further from workout times while maintaining protein intake.</p>
        
        <p><strong>For performance:</strong> Prioritize carbohydrate timing before, during, and after workouts to maintain energy levels and optimize recovery.</p>
        
        <h3>Individualization Is Key</h3>
        
        <p>While these guidelines provide a starting point, individual responses to nutrition timing vary. Factors to consider include:</p>
        <ul>
          <li>Personal digestive comfort</li>
          <li>Training schedule and lifestyle</li>
          <li>Specific fitness goals</li>
          <li>Individual metabolic factors</li>
        </ul>
        
        <h3>Conclusion</h3>
        
        <p>Strategic nutrition timing can enhance your workout performance, accelerate recovery, and optimize your results. Experiment with different approaches while monitoring your energy levels, performance, and recovery to find what works best for your body and goals.</p>
      `
    },
    {
      id: 6,
      title: "Mind-Muscle Connection",
      category: "Technique",
      icon: Target,
      image: "https://i.pinimg.com/1200x/ff/08/e7/ff08e77c7ab99a559fb38565332743bf.jpg",
      excerpt: "Focus on the muscles you're working to improve activation and results.",
      content: "Concentrate on feeling the target muscles work during each exercise. This mental focus can significantly improve muscle activation and growth.",
      readTime: "4 min read",
      tips: [
        "Visualize the muscle working",
        "Use slower, controlled movements",
        "Reduce weight if needed to feel the muscle",
        "Practice meditation to improve focus"
      ],
      fullArticle: `
        <h2>Mind-Muscle Connection: The Mental Side of Physical Training</h2>
        
        <p>The mind-muscle connection is more than just fitness jargon—it's a scientifically validated concept that can significantly enhance your training results. By consciously focusing on the specific muscles you're working during exercise, you can increase muscle activation, improve movement quality, and accelerate progress.</p>
        
        <h3>The Science Behind the Mind-Muscle Connection</h3>
        
        <p>Research has shown that consciously focusing on a specific muscle during exercise increases the neural drive to that muscle. This enhanced neuromuscular activation leads to:</p>
        
        <ul>
          <li>Greater muscle fiber recruitment</li>
          <li>Improved motor learning and movement patterns</li>
          <li>Better isolation of target muscles</li>
          <li>Potentially greater hypertrophy (muscle growth)</li>
        </ul>
        
        <p>A 2018 study published in the European Journal of Sport Science found that participants who focused on their muscles during resistance training showed significantly greater muscle growth than those who didn't, even when using the same weights and repetitions.</p>
        
        <h3>Developing Your Mind-Muscle Connection</h3>
        
        <p><strong>Start with isolation exercises:</strong> Single-joint movements like bicep curls or lateral raises are easier to connect with mentally than complex movements.</p>
        
        <p><strong>Reduce the weight:</strong> Using lighter weights initially allows you to focus on the sensation rather than struggling with the load.</p>
        
        <p><strong>Slow down the movement:</strong> Performing exercises at a slower tempo—especially the eccentric (lowering) phase—enhances proprioception and muscle awareness.</p>
        
        <p><strong>Use visualization:</strong> Before and during the exercise, visualize the target muscle contracting and relaxing. Picture its anatomical position and function.</p>
        
        <p><strong>Implement tactile cues:</strong> Touching the working muscle with your hand or having a training partner do so can enhance awareness.</p>
        
        <h3>Practical Applications for Different Training Goals</h3>
        
        <p><strong>For hypertrophy (muscle building):</strong> Focus intensely on the target muscle throughout the entire range of motion, feeling the muscle stretch and contract.</p>
        
        <p><strong>For strength training:</strong> Use the mind-muscle connection during warm-up sets, then shift focus to movement power and technique during heavier lifts.</p>
        
        <p><strong>For rehabilitation:</strong> The mind-muscle connection is crucial for reactivating muscles after injury and ensuring proper movement patterns.</p>
        
        <h3>Common Obstacles and Solutions</h3>
        
        <p><strong>Distraction:</strong> Minimize external distractions by using headphones and choosing quieter gym areas when possible.</p>
        
        <p><strong>Fatigue:</strong> As you tire, mental focus often diminishes. This is a good time to end your set rather than continuing with poor form and connection.</p>
        
        <p><strong>Complex movements:</strong> For multi-joint exercises like squats, focus on one primary muscle group per set (e.g., quads for one set, glutes for another).</p>
        
        <h3>Beyond the Gym: Mental Training</h3>
        
        <p>Developing your mind-muscle connection extends beyond workout time:</p>
        
        <ul>
          <li>Practice body awareness through activities like yoga or tai chi</li>
          <li>Implement regular meditation to improve focus and concentration</li>
          <li>Study muscle anatomy to better understand what you're targeting</li>
          <li>Use visualization techniques during rest days to reinforce neural pathways</li>
        </ul>
        
        <h3>Conclusion</h3>
        
        <p>The mind-muscle connection represents the crucial link between mental focus and physical results. By training your brain alongside your body, you can transform ordinary movements into highly effective exercises that deliver superior results. Like any skill, this connection improves with consistent practice and attention.</p>
      `
    }
  ];

  const nextTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const prevTip = () => {
    setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
  };

  const getCategoryClass = (category) => {
    const classes = {
      Technique: 'category-technique',
      Nutrition: 'category-nutrition',
      Recovery: 'category-recovery',
      Training: 'category-training'
    };
    return classes[category] || '';
  };

  // Handle opening the article modal
  const handleOpenArticle = (article) => {
    setSelectedArticle(article);
    setShowArticleModal(true);
    // Prevent background scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowArticleModal(false);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  return (
    <section id="tips" className="tips-section">
      <div className="tips-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="tips-header"
          ref={ref}
        >
          <h2 className="tips-title">
            Fitness <span className="tips-title-highlight">Tips & Advice</span>
          </h2>
          <p className="tips-subtitle">
            Expert tips and advice to help you maximize your workouts, improve your nutrition, 
            and achieve your fitness goals faster.
          </p>
        </motion.div>

        {/* Featured Tip Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="featured-tip-container"
        >
          <div className="featured-tip-card">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTip}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
                className="featured-tip-content"
              >
                {/* Image */}
                <div className="featured-tip-image-container">
                  <img
                    src={tips[currentTip].image}
                    alt={tips[currentTip].title}
                    className="featured-tip-image"
                  />
                </div>

                {/* Content */}
                <div className="featured-tip-text">
                  <div className="tip-meta">
                    <span className={`tip-category ${getCategoryClass(tips[currentTip].category)}`}>
                      {tips[currentTip].category}
                    </span>
                    <span className="tip-read-time">
                      {tips[currentTip].readTime}
                    </span>
                  </div>

                  <h3 className="tip-title">{tips[currentTip].title}</h3>
                  <p className="tip-content">
                    {tips[currentTip].content}
                  </p>

                  <div className="tip-key-points">
                    <h4 className="key-points-title">Key Points:</h4>
                    <ul className="key-points-list">
                      {tips[currentTip].tips.map((tip, index) => (
                        <li key={index} className="key-point-item">
                          <div className="key-point-bullet" />
                          <span className="key-point-text">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="read-more-button"
                    onClick={() => handleOpenArticle(tips[currentTip])}
                  >
                    Read Full Article
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTip}
            className="carousel-nav-button prev"
            aria-label="Previous tip"
          >
            <ChevronLeft className="carousel-nav-icon" />
          </button>
          <button
            onClick={nextTip}
            className="carousel-nav-button next"
            aria-label="Next tip"
          >
            <ChevronRight className="carousel-nav-icon" />
          </button>

          {/* Indicators */}
          <div className="carousel-indicators">
            {tips.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTip(index)}
                className={`carousel-indicator ${
                  currentTip === index ? 'active' : 'inactive'
                }`}
                aria-label={`Go to tip ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="tips-grid"
        >
          {tips.slice(0, 6).map((tip, index) => {
            const Icon = tip.icon;
            return (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="tip-card"
                onClick={() => setCurrentTip(index)}
              >
                <div className="tip-card-header">
                  <div className="tip-icon-container">
                    <Icon className="tip-icon" />
                  </div>
                  <span className={`tip-category ${getCategoryClass(tip.category)}`}>
                    {tip.category}
                  </span>
                </div>

                <h3 className="tip-card-title">
                  {tip.title}
                </h3>
                <p className="tip-card-excerpt">
                  {tip.excerpt}
                </p>
                <div className="tip-card-footer">
                  <span className="tip-card-read-time">
                    {tip.readTime}
                  </span>
                  <motion.span
                    whileHover={{ x: 5 }}
                    className="tip-card-read-more"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenArticle(tip);
                    }}
                  >
                    Read More →
                  </motion.span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Full Article Modal */}
      <AnimatePresence>
        {showArticleModal && selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="article-modal-overlay"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="article-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="article-modal-header">
                <div className="article-modal-meta">
                  <span className={`article-category ${getCategoryClass(selectedArticle.category)}`}>
                    {selectedArticle.category}
                  </span>
                  <span className="article-read-time">{selectedArticle.readTime}</span>
                </div>
                <button 
                  className="article-modal-close"
                  onClick={handleCloseModal}
                  aria-label="Close article"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="article-modal-content">
                <div className="article-modal-image-container">
                  <img 
                    src={selectedArticle.image} 
                    alt={selectedArticle.title} 
                    className="article-modal-image"
                  />
                </div>
                
                <h1 className="article-modal-title">{selectedArticle.title}</h1>
                
                <div 
                  className="article-modal-body"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.fullArticle }}
                />
                
                <div className="article-modal-actions">
                  <button className="article-action-button">
                    <ThumbsUp size={18} />
                    <span>Like</span>
                  </button>
                  <button className="article-action-button">
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                  <button className="article-action-button">
                    <Bookmark size={18} />
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default WorkoutTips;
