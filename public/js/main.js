document.addEventListener("DOMContentLoaded", function() {
  const currentUser = document.querySelector('meta[name="current-user-id"]').content;
  const polls = JSON.parse(document.querySelector('meta[name="current-page-polls"]').content || "[]");
  const vPolls = JSON.parse(document.querySelector('meta[name="user-voted-polls"]').content || "[]");


  polls.forEach(function(poll) {
    poll.voters.forEach(function(voter) {
      if (voter.voterId === currentUser) {
        poll.options.forEach(function(option){
          voter.selectedOptions.forEach(function(opt){
            if(opt === option.optionName){
              const optDot = document.getElementById(`optDot-${option._id}`);
              optDot.style.display = 'flex';
            }
          });
        });

        const pollElement = document.getElementById(`poll-${poll._id}`);

        let totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);

        poll.options.forEach(function(option) {

          const optionElement = document.getElementById(`option-${option._id}`);
          const votePercentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
          optionElement.querySelector(".vote-count").textContent = votePercentage.toFixed(1) + "%";
          const progressBar = optionElement.querySelector(".progress-bar");
          if (progressBar) {
            progressBar.style.width = `${votePercentage}%`;
          }
        });
      }
    });
  });

  function handleFollow(pollId){
    fetch("/follow",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pollId
      })
    }).then((response) =>
      response.json()
    ).then(data => {
      if(data.success){
        updateFollowUI(data);
      } else if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        console.error("failed to follow");
      }
    }).catch((error) => console.error(error));
  }


  function handleVote(pollId, voteOption) {
    fetch("/vote", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pollId,
        voteOption
      })
    }).then((response) =>
      response.json()
    ).then(data => {
      if (data.success) {
        updateVoteUI(data.poll);
      } else if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        console.error("failed to vote");
      }
    }).catch((error) => console.error(error));
  }

  function handleSave(pollId) {
    fetch("/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pollId
      })
    }).then((response) =>
      response.json()
    ).then(data => {
      if (data.success) {
        updateSaveUI(data.poll);
      } else if (data.redirect) {
        window.location.href = data.redirect;
      } else {
        console.error("failed to save");
      }
    }).catch((error) => console.error(error));
  }

  function updateFollowUI(data) {

  }

  function updateVoteUI(poll) {
    poll.options.forEach(function(option){
      const optDot = document.getElementById(`optDot-${option._id}`);
      optDot.style.display = 'none';
    });
    poll.voters.forEach(function(voter){
      if (voter.voterId === currentUser) {
        poll.options.forEach(function(option){
          const optDot = document.getElementById(`optDot-${option._id}`);

          voter.selectedOptions.forEach(function(opt){
            if(option.optionName === opt){
              optDot.style.display = 'flex';
            }
          });
        });
      }
    })
    const voteElement = document.getElementById(`poll-${poll._id}`);

    if (voteElement) {
      let totalVotes = 0;

      poll.options.forEach(function(option) {
        totalVotes += option.voteCount;
      });

      poll.options.forEach(function(option) {
        const opt = document.getElementById(`option-${option._id}`);
        const votePercentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;
        opt.querySelector(".vote-count").textContent = votePercentage.toFixed(1) + "%";

        const progressBar = opt.querySelector(".progress-bar");
        progressBar.style.width = `${votePercentage}%`;

      });
    }
  }




  function updateSaveUI(poll) {
    const saveElement = document.getElementById(`poll-${poll._id}`);
    if (saveElement) {
      saveElement.querySelector(".save svg").setAttribute("fill", poll.savers.includes(currentUser) ? "black" : "none");
      showMessage(poll.savers.includes(currentUser) ? "Saved" : "Unsaved");
    }
  }

  document.querySelectorAll(".comment").forEach(function(button) {
    button.addEventListener("click", function() {
      if (currentUser) {
        const pollId = this.getAttribute("data-poll-id");
        openModal(pollId);
      } else {
        window.location.href = "/login";
      }
    });
  });


  document.querySelectorAll(".save").forEach(function(button) {
    button.addEventListener("click", function() {
      const pollId = this.getAttribute("data-poll-id");
      handleSave(pollId);
    });
  });


  document.querySelectorAll(".option").forEach(function(optionElement) {
    optionElement.addEventListener("click", function() {
      const pollId = this.getAttribute("data-poll-id");
      const voteOption = this.getAttribute("data-vote-option");
      handleVote(pollId, voteOption);
    });
  });

  document.querySelectorAll(".follow").forEach(function(followElement) {
    followElement.addEventListener("click", function() {
      const hostId = this.getAttribute("data-host-id");
      handleFollow(hostId);
    });
  });








});
